---
title: Git Getting Started
image: https://i.imgur.com/8Q68xYb.png
tags:
  - git
  - reference
  - cheatsheet
description: A concise introduction to Git covering the essential first steps to initialize repositories, connect remotes, and start tracking changes.
comments: true
---

## Create your first repository

At the command line, first verify that you have Git installed:

On all operating systems:

```bash
git --version
```

!!! note
    If nothing is returned, or the command is not recognized, you may have to install Git on your system by downloading and running the installer. See the [Git homepage](https://git-scm.com/) for exceptionally clear and easy installation instructions.

After installing Git, configure your username and email address. Do this before making a commit.

```bash
git config --global user.name "Your Name"
git config --global user.email "mail@example.com"
```

Once Git is installed, navigate to the directory you want to place under version control and create an empty Git repository:

```bash
git init
```

This creates a hidden folder, `.git`, which contains the plumbing needed for Git to work.

Next, check what files Git will add to your new repository; this step is worth special care:

```bash
git status
```

Review the resulting list of files; you can tell Git which of the files to place into version control (avoid adding files with confidential information such as passwords, or files that just clutter the repo):

```bash
git add <file/directory name #1> <file/directory name #2> <...>
```

If all files in the list should be shared with everyone who has access to the repository, a single command will add everything in your current directory and its subdirectories:

```bash
git add .
```

This will "stage" all files to be added to version control, preparing them to be committed in your first commit.

For files that you want never under version control, create and populate a file named `.gitignore` before running the `add` command.

Commit all the files that have been added, along with a commit message:

```bash
git commit -m "Initial commit"
```

This creates a new commit with the given message. A commit is like a save or snapshot of your entire project. You can now push, or upload, it to a remote repository, and later you can jump back to it if necessary. If you omit the `-m` parameter, your default editor will open and you can edit and save the commit message there.

## Adding a remote

To add a new remote, use the `git remote add` command on the terminal, in the directory your repository is stored at.

The `git remote add` command takes two arguments:

1. A remote name, for example, `origin`
2. A remote URL, for example, `https://<your-git-service-address>/user/repo.git`

```bash
git remote add origin https://<your-git-service-address>/owner/repository.git
```

!!! note
    Before adding the remote you have to create the required repository in your git service. You'll be able to push/pull commits after adding your remote.

## Clone a repository

The `git clone` command is used to copy an existing Git repository from a server to the local machine.

For example, to clone a GitHub project:

```bash
cd <path where you would like the clone to create a directory>
git clone https://github.com/username/projectname.git
```

To clone a BitBucket project:

```bash
cd <path where you would like the clone to create a directory>
git clone https://yourusername@bitbucket.org/username/projectname.git
```

This creates a directory called `projectname` on the local machine, containing all the files in the remote Git repository. This includes source files for the project, as well as a `.git` sub-directory which contains the entire history and configuration for the project.

To specify a different name of the directory, e.g. `MyFolder`:

```bash
git clone https://github.com/username/projectname.git MyFolder
```

Or to clone in the current directory:

```bash
git clone https://github.com/username/projectname.git .
```

!!! note
    When cloning to a specified directory, the directory must be empty or non-existent.

!!! tip
    You can also use the ssh version of the command:
    ```bash
    git clone git@github.com:username/projectname.git
    ```
    Both HTTPS and SSH are secure and widely used. SSH is often preferred and recommended by some hosting services like GitHub.


## Setting your user name and email

You need to set who you are **before** creating any commit. That will allow commits to have the right author name and email associated to them.

It has nothing to do with authentication when pushing to a remote repository (e.g. when pushing to a remote repository using your GitHub, BitBucket, or GitLab account)

To declare that identity for all repositories, use `git config --global`. This will store the setting in your user's `.gitconfig` file: e.g. `$HOME/.gitconfig` or for Windows, `%USERPROFILE%\.gitconfig`.

```bash
git config --global user.name "Your Name"
git config --global user.email "mail@example.com"
```

To declare an identity for a single repository, use `git config` inside a repo. This will store the setting inside the individual repository, in the file `$GIT_DIR/config`. e.g. `/path/to/your/repo/.git/config`.

```bash
cd /path/to/my/repo
git config user.name "Your Login At Work"
git config user.email "mail_at_work@example.com"
```

Settings stored in a repository's config file will take **precedence** over the global config when you use that repository.

!!! tip
    if you have different identities (one for open-source project, one at work, one for private repos, ...), and you don't want to forget to set the right one for each different repos you are working on:

    Remove a global identity:

    ```bash
    git config --global --unset user.name
    git config --global --unset user.email
    ```

    To force git to look for your identity only within a repository's settings, not in the global config:

    ```bash
    git config --global user.useConfigOnly true
    ```

    That way, if you forget to set your `user.name` and `user.email` for a given repository and try to make a commit, you will see:

    ```console
    no name was given and auto-detection is disabled
    no email was given and auto-detection is disabled
    ```

## Setting up the upstream remote

If you have cloned a fork (e.g. an open source project on Github) you may not have push access to the original repository. In that case, you typically configure:

- `origin`: your fork
- `upstream`: the original repository

First check the remote names:

```bash
$ git remote -v
origin  https://github.com/myusername/repo.git (fetch)
origin  https://github.com/myusername/repo.git (push)
upstream  # this line may or may not be here
```

If `upstream` is there already (it is on some Git versions) you need to set the URL (currently it's empty):

```bash
$ git remote set-url upstream https://github.com/projectusername/repo.git
```

If it does not exist, add it:

```bash
$ git remote add upstream https://github.com/projectusername/repo.git
```

You can also add additional remotes (for example, a colleague's fork):

```bash
$ git remote add dave https://github.com/dave/repo.git
```

## Learning about a command

To get more information about any git command - i.e. details about what the command does, available options and other documentation - use the `--help` option or the `help` command.

For example, to get all available information about the `git diff` command, use:

```bash
git diff --help
git help diff
```

Similarly, to get all available information about the `status` command, use:

```bash
git status --help
git help status
```

If you only want a quick help showing you the meaning of the most used command line flags, use `-h`:

```bash
git checkout -h
```

## Set up SSH for Git

If you are using Windows open Git Bash. If you are using Mac or Linux open your Terminal.

Before you generate an SSH key, you can check to see if you have any existing SSH keys.

List the contents of your `~/.ssh` directory:

```bash
$ ls -al ~/.ssh  # Lists all the files in your ~/.ssh directory
```

Check the directory listing to see if you already have a public SSH key. By default the filenames of the public keys are one of the following:

- `id_dsa.pub`
- `id_ecdsa.pub`
- `id_ed25519.pub`
- `id_rsa.pub`

If you see an existing public and private key pair listed that you would like to use on your Bitbucket, GitHub (or similar) account you can copy the contents of the `id_*.pub` file.

If not, you can create a new public and private key pair with the following command:

```bash
$ ssh-keygen
```

Press the Enter or Return key to accept the default location. Enter and re-enter a passphrase when prompted, or leave it empty.

Ensure your SSH key is added to the ssh-agent. Start the ssh-agent in the background if it's not already running:

```bash
$ eval $(ssh-agent -s)
```

Add you SSH key to the ssh-agent. Notice that you'll need to replace `id_rsa` in the command with the name of your private key file:

```bash
$ ssh-add ~/.ssh/id_rsa
```

If you want to change the upstream of an existing repository from HTTPS to SSH you can run the following command:

```bash
$ git remote set-url origin git@github.com:yourusername/your_project.git
```

In order to clone a new repository over SSH you can run the following command:

```bash
$ git clone git@github.com:yourusername/your_project.git
```

## Sharing code

To share your code you create a repository on a remote server to which you will copy your local repository.

To minimize the use of space on the remote server you create a bare repository: one which has only the `.git` objects and doesn't create a working copy in the filesystem. As a bonus you set this remote as an upstream server to easily share updates with other programmers.

On the remote server:

```bash
git init --bare /path/to/repo.git
```

On the local machine:

(Note that `ssh:` is just one possible way of accessing the remote repository.)

Now copy your local repository to the remote:

```bash
git push --set-upstream origin master
```

Adding `--set-upstream` (or `-u`) created an upstream (tracking) reference which is used by argument-less Git commands, e.g. `git pull`.
