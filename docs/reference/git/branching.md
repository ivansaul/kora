---
title: Git Branching
image: https://i.imgur.com/XZgMLaq.png
tags:
  - git
  - reference
  - cheatsheet
description: A practical Git branching reference covering branch creation, switching, remote tracking, deletion, renaming, orphan branches, and advanced history manipulation.
comments: true
---

## Creating a new branch

To create a new branch, while staying on the current branch, use:

```bash
git branch <name>
```

Generally, the branch name must not contain spaces and is subject to other specifications listed [here](https://git-scm.com/docs/git-check-ref-format).

## Switching between branches

To switch to an existing branch:

```bash
git switch <name>
```

To create a new branch and switch to it:

```bash
git switch -c <name>
```

To create a branch at a point other than the last commit of the current branch (also known as HEAD), use either of these commands:

```bash
git branch <name> [<start-point>]
git switch -c <name> [<start-point>]
```

The `<start-point>` can be any revision known to git (e.g. another branch name, commit SHA, or a symbolic reference such as HEAD or a tag name):

```bash
git switch -c <name> some_other_branch
git switch -c <name> af295
git switch -c <name> HEAD~5
git switch -c <name> v1.0.5
```

To create a branch from a remote branch (the default `<remote_name>` is origin):

```bash
git switch -c <name> <remote_name>/<branch_name>
```

If a given branch name is only found on one remote, you can simply use

```bash
git switch <branch_name>
```

!!! question 
    **How do I quickly switch to the previous branch?**

    You can quickly switch to the previous branch using
    
    ```bash
    git switch  -
    ```

!!! example
    **Moving recent commits to a new branch:**
    
    Sometimes you may need to move several of your recent commits to a new branch. This can be achieved by branching and "rolling back", like so:

    ```bash
    git branch newBranch
    git reset --hard HEAD~2  # Go back 2 commits, you will lose uncommitted work.
    git switch newBranch
    ```

    Here is an illustrative explanation of this technique:

    Initial state:
    
    ```
    A - B - C - D - E (HEAD)
                    ↑
                  master
    ```

    After `git branch <new_name>`:

    ```
                newBranch
                    ↓
    A - B - C - D - E (HEAD)
                    ↑
                  master
    ```

    After `git reset --hard HEAD~2`:
    
    ```
                newBranch
                    ↓
    A - B - C - D - E (HEAD)
            ↑
          master
    ```

    After `git switch <new_name>`:
    
    ```
                newBranch
                    ↓
    A - B - C - D - E (HEAD)
            ↑
          master
    ```

## Listing branches

Git provides multiple commands for listing branches. All commands use the function of `git branch`, which will provide a list of a certain branches, depending on which options are put on the command line. Git will if possible, indicate the currently selected branch with a star next to it.

| Goal | Command |
|------|---------|
| List local branches | `git branch` |
| List local branches verbose | `git branch -v` |
| List remote and local branches | `git branch -a` OR `git branch --all` |
| List remote and local branches (verbose) | `git branch -av` |
| List remote branches | `git branch -r` |
| List remote branches with latest commit | `git branch -rv` |
| List merged branches | `git branch --merged` |
| List unmerged branches | `git branch --no-merged` |
| List branches containing commit | `git branch --contains [<commit>]` |

!!! note
    - Adding an additional `v` to `-v` e.g. `git branch -avv` or `git branch -vv` will print the name of the upstream branch as well.
    - Branches shown in red color are remote branches

## Deleting a branch

### Remote branch

To delete a branch on the origin remote repository, you can use:

```bash
git push origin --delete <branchName>
```

### Local branch

To delete a local branch. Note that this will not delete the branch if it has any unmerged changes:

```bash
git branch -d <branchName>
```

To delete a branch, even if it has unmerged changes:

```bash
git branch -D <branchName>
```

## Rename a branch

Rename the branch you have checked out:

```bash
git branch -m new_branch_name
```

Rename another branch:

```bash
git branch -m branch_you_want_to_rename new_branch_name
```

## Searching in branches

To list local branches that contain a specific commit or tag

```bash
git branch --contains <commit>
```

To list local and remote branches that contain a specific commit or tag

```bash
git branch -a --contains <commit>
```

## Push branch to remote

Use to push commits made on your local branch to a remote repository.

The `git push` command takes two arguments:

- A remote name, for example, `origin`
- A branch name, for example, `master`

For example:

```bash
git push <REMOTENAME> <BRANCHNAME>
```

As an example, you usually run `git push origin master` to push your local changes to your online repository.

Using `-u` (short for `--set-upstream`) will set up the tracking information during the push.

```bash
git push -u <REMOTENAME> <BRANCHNAME>
```

!!! note
    By default, git pushes the local branch to a remote branch with the same name. For example, if you have a local branch called `new-feature`, if you push the local branch it will create a remote branch `new-feature` as well. If you want to use a different name for the remote branch, append the remote name after the local branch name, separated by `:`:

    ```bash
    git push <REMOTENAME> <LOCALBRANCHNAME>:<REMOTEBRANCHNAME>
    ```

## Create an orphan branch (branch with no parent commit)

```bash
git switch --orphan new-orphan-branch
```

The first commit made on this new branch will have no parents and it will be the root of a new history totally disconnected from all the other branches and commits.

## Move current branch HEAD to an arbitrary commit

A branch is just a pointer to a commit, so you can freely move it around. To make it so that the branch is referring to the commit `aabbcc`, issue the command

```bash
git reset --hard aabbcc
```

Please note that this will overwrite your branch's current commit, and as so, its entire history. You might loose some work by issuing this command. If that's the case, you can use the reflog to recover the lost commits. It can be advised to perform this command on a new branch instead of your current one.

However, this command can be particularly useful when rebasing or doing such other large history modifications.

## Command Summary

| Option            | Description                                  |
| ----------------- | -------------------------------------------- |
| `-d`, `--delete`  | Delete a branch (must be fully merged).      |
| `-D`              | Force delete branch.                         |
| `-m`, `--move`    | Rename a branch.                             |
| `-M`              | Force rename branch.                         |
| `-r`, `--remotes` | List or delete remote-tracking branches.     |
| `-a`, `--all`     | List local and remote branches.              |
| `--list`          | Explicitly list branches matching a pattern. |
