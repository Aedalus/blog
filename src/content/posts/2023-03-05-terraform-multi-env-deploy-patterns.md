---
layout: "../../layouts/MarkdownPostLayout.astro"
title: Terraform with Multiple Environments
pubDate: "2023-03-05"
image:
  url: "https://docs.astro.build/assets/arc.webp"
  alt: "Thumbnail of Astro arcs."
tags:
  - Terraform
summary: |
  Deploying terraform is hard. Far harder than writing it. While there are a few established patterns, most come with some sharp trade-offs when considering multi-environment setups.
draft: false
---

## Multi Environment Terraform

Deploying terraform is hard. Far harder than writing it. In an ideal world, you can version and deploy your terraform just like application code. However as you deploy your infrastructure to more and more environments, it becomes trickier and trickier to keep environments in a state of sync with each other.
I like to think of terraform standardization in two dimensions.

**Horizontal Standardization** - Between _different_ projects - This kind of standardization focuses on reusability. The [native terraform modules](https://developer.hashicorp.com/terraform/language/modules) provide a great mechanism for this, and the solution ultimately resembles the same kinds of library reuse seen in other languages.

**Vertical Standardization** - Between environments in the _same_ project - This is a problem more unique to Infrastructure as Code (IaC) tools. With application code, the worst that happens is different environments have different application versions. With IaC, it's quite possible each environment has radical differences. Some of these may be intentional, like resource sizing. The unintentional (often unknown) differences are the most dangerous, and can pose real operational risk.

In practice I've found **Vertical Standardization** to be the more unsolved problem with much sharper trade-offs. Let's walk through a couple common terraform patterns that seem good to start, but ultimately have issues here.

---

## Pattern 1 - Git Branch Strategy

This is a pattern I often see used with **gitflow** processes. The main idea goes:

- Keep all my terraform in the app repo in a directory
- Have separate var files for dev/prod
- Merge to Develop -> CI/CD deploys infra to dev
- Merge to Main -> CI/CD deploys infra to prod

There are quite a lot of variations on this pattern, like triggering deploys off of tags, etc. I also want to stress that **this pattern works great if you only have one or two environments to worry about**. If that's you currently, awesome. Close this page, come back when you have more environments and more headaches.

Even with only two environments though, there are a few issues that start to rise up:

- **Hotfixes** - Ideally you test the fix in dev, but in emergency cases you may just need to fix prod. There likely needs to be another process/entry point for the CI/CD pipeline. Not horrible, but less elegant.
- **Rollbacks** - You just shipped the latest cool infra and it broke everything. Ideally you can just re-run a CI/CD pipeline for prod targeting the previous SHA. It's been a while, but you remember how _right?_
- **Keep Envs in Sync** - The good thing here is if we compare the separate var files, we _should_ understand all the differences between environments. But what was even the last version we deployed to prod?

Now none of the above are horrible, and can often be mitigated with talented folks and good CI/CD tooling. But we start to see the cracks where this pattern may not scale as well for more than 2-3 environments.

---

## Pattern 2 - Env Folders

This is a pattern I've seen to try and scale out to multiple environments. The main idea goes:

- Have a separate directory per environment in the application repo
- Keep terraform for each environment in the relative folder
- CI/CD deploys terraform off of the main branch

This is both a pattern [hashicorp recommends](https://developer.hashicorp.com/terraform/tutorials/modules/organize-configuration), while also acknowledging the main limitation.

> Directory-separated environments rely on duplicate Terraform code. This may be useful if you want to test changes in a development environment before promoting them to production. However, the directory structure runs the risk of creating drift between the environments over time.

Despite the main issues of configuration drift, this is the first pattern that can scale to multiple environments, and truly scale well. It's easy to have hundreds of folders maintaining their own terraform configuration. The issue becomes keeping them in sync. **This pattern works great when you're not concerned about drift between environments.** This pattern has tradeoffs:

- **Hotfixes** - Trivial in this model. Just update whatever is needed in the relevant environment.
- **Rollbacks** - Similarly trivial.
- **Keep Envs in Sync** - Horrible. Environments will drift. If you have changes involving dozens of individual terraform resources, it's practically difficult to copy those same resources between dozens of folders. Comparing the contents of both directories should show deltas between the environments, but can still be tricky to detect drift in practice.
- **Versioning and Promoting** - In this model we can't really version the infrastructure like application code. A single tag of `v1.2.3` on the repo may refer to drastically different infra in each environment.

---

## Pattern 3 - Deploy Repo

This is the pattern I've landed on the last few years for deploying application infrastructure. It tries to take the best of both of the above patterns. I find it reduces far more complexity than it adds. It goes like:

- Have a **terraform** directory in my application repo. This will be versioned with my application.
- Fully variablize the terraform. Don't have any values in the app repo.
- Have a **separate centralized deploy monorepo** for the organization.
- In the centralized deploy repo, use **manifest files** to declare what terraform you want deployed where, with the given version and variables.
- On PRs in deploy repo, detect what project changes, and plan/apply accordingly.

In practice the centralized deploy repo may look like the following:

```
dev/
  foo-service/
    manifest.yaml
  bar-service/
    manifest.yaml
stage/
  foo-service/
    manifest.yaml
  bar-service/
    manifest.yaml
prod/
  foo-service/
    manifest.yaml
  bar-service/
    manifest.yaml
```

I've found it easiest to organize first by environment, then by application. CICD tooling often works easier on file structure than file content, so organizing like this often allows for defaults to be created per env. Each manifest file contains a short description of what is being deployed.

```yaml
# dev/foo-service/manifest.yaml
repo: foo-service
version: v1.2.3
vars:
  env_name: dev
  instance_size: m5.large
  flag_new_feature: true
```

This manifest file becomes pretty trivial for any CI/CD script to process and perform the relevant git clone, provide terraform state configuration, and then terraform plan/apply with the provided variables.

It's also certainly possible just to use vanilla terraform root modules here instead, where each root module has one and only one submodule. **With this it's just too tempting to add _just one_ resource outside the module that an environment needs.** And suddenly environments are out of sync, and there is infrastructure for an application existing outside of it's source repo.

```hcl
# Don't recommend this in practice
module "foo_service" {
  source = "github.com/me/foo-service?version=1.2.3"

  env_name         = dev
  instance_size    = m5.large
  flag_new_feature = true
}
```

One tool I do find very useful here is [terragrunt](https://terragrunt.gruntwork.io/docs/getting-started/quick-start/). In fact, all my **manifest.yaml**'s are _actually_ **terragrunt.hcl** files in practice. It's nice, because terragrunt will let you just run **terragrunt plan/apply** as if that file was the terraform itself.

```hcl
# Point to the code/version you want to deploy
terraform {
  source = "github.com/me/foo-service?version=1.2.3"
}

# Provide inputs
inputs = {
  env_name         = dev
  instance_size    = m5.large
  flag_new_feature = true
}

# Just have terragrunt generate the backend config
generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents = <<EOF
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "my-lock-table"
  }
}
EOF
}
}
```

I want to stress **terragrunt is not a requirement of this pattern**. I just find it follows a similar philosophy, and makes life easy. It's definitely possible just to drive pipelines strictly from the yaml manifests.

Let's look at how this pattern handles some of the common concerns.

- **Hotfixes** - Pretty darn easy. Can make a **hotfix-<ticket>** branch on the app repo, and even just use that branch name in the **ref=** part of the source to deploy in case of emergencies. Otherwise we merge as normal, and just bump the source block as needed.
- **Rollbacks** - Super easy. Just revert the **ref=** value to whatever tag you want. The exact same process as deploying new versions, so mental overhead for rollbacks is near non-existant.
- **Keep Envs in Sync** - Super easy, since we can tell the difference between environments just looking at the manifest files.
- **Versioning and Promoting** - Amazing. If you need to rollout a new version to even hundreds of environments, this becomes as easy as a find-replace in the manifest files. In fact this approach lends itself _incredibly_ well to bulk automation.

Alright, but what _doesn't_ this pattern do well?

- **Easy Plans** - Because you're writing terraform in one repo, and deploying in another, it's difficult to get plans before merging into the main repo. In practice I've found **terraform validate** to catch 99% of issues, but this can still be hard for those ramping up. With enough tooling this can be mitigated though.
- **CI/CD Complexity** - The deploy monorepo becomes the central place for everyone's deployments. This can actually be really good as a single place to manage CI checks, like security scanning. On the other hand, the CI/CD pipelines generally have to be smarter to operate in a monorepo context, and the centralized nature generally requires a central team to own it. Similarly tooling is needed to ensure a version can't normally be deployed to prod before being deployed to lowers, etc.

---

## Final Thoughts

The hardest part of terraform is still usually deploying it at scale to a large number of environments. The third pattern presented here has served me very well the past few years, and moves this issue slightly more towards "solved" for me.

I've used it at organizations with hundreds of projects for 1000s of manifest files, and it's scaled beautifully.

What I'm starting to realize more and more is that this pattern _isn't_ just limited to terraform though. Declarative deployments are a standard across a huge number of IaC tools. It's more a philosophy than a feature. And in most of these cases, the deploy repo provides the same benefits it does for terraform. I think it's quite possible to combine multiple tooling into one unified deploy system, where **terraform.manifest.yaml**, **serverless.manifest.yaml**, **argo.manifest.yaml**, **pulumi.manifest.yaml**, **etc.manifest.yaml** files are all understood by the centralized system, and managed similarly.
