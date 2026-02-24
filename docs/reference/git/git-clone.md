---
title: Git Clone
image: https://i.imgur.com/xSA4JET.png
tags:
  - git
  - reference
  - cheatsheet
description: Learn how to use the Git Clone command to download a remote repository, including options for shallow, specific branch, and recursive clones.
comments: true
---

## Shallow Clone

Cloning a huge repository (like a project with multiple years of history) might take a long time, or fail because of the amount of data to be transferred. In cases where you don't need to have the full history available, you can do a shallow clone:

```bash
git clone [repo_url] --depth 1
```

The above command will fetch just the last commit from the remote repository.

Be aware that you may not be able to resolve merges in a shallow repository. It's often a good idea to take at least as many commits are you are going to need to backtrack to resolve merges. 

For example, to instead get the last 50 commits:

```bash
git clone [repo_url] --depth 50
```

!!! tip
    Later, if required, you can fetch the rest of the repository:

    ```bash
    git fetch --unshallow 
    ```
    
## Regular Clone

To download the entire repository including the full history and all branches, type:

```bash
git clone <url>
```

The example above will place it in a directory with the same name as the repository name.

To download the repository and save it in a specific directory, type:

```bash
git clone <url> [directory]
```

## Clone a specific branch

To clone a specific branch of a repository, type `--branch <branch name>` before the repository url:

```bash
git clone --branch <branch name> <url> [directory]
```

To use the shorthand option for `--branch`, type `-b`. This command downloads entire repository and checks out `<branch name>`.

To save disk space you can clone history leading only to single branch with:

```bash
git clone --branch <branch_name> --single-branch <url> [directory]
```

!!! tip
    If you cloned with `--single-branch` and later need all branches, run:

    ```bash
    git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
    git fetch origin
    ```

## Clone recursively

```bash
git clone <url> --recursive
```

Clones the repository and also clones all `submodules`. If the submodules themselves contain additional submodules, Git will also clone those.

## Clone using a proxy

If you need to download files with git under a proxy, setting proxy server system-wide couldn't be enough. You could also try the following:

```bash
git config --global http.proxy http://<proxy-server>:<port>
```

## References

For more information on cloning repositories, visit the official Git documentation.

- [Git Clone](https://git-scm.com/docs/git-clone)
