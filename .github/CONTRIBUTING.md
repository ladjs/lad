
# Contributing to CrocodileJS

Please follow the simple steps below when contributing to Crocodile.


## 1. Fork

Fork the project on GitHub and clone your fork locally:

```bash
git clone git@github.com:username/crocodile.git
cd crocodile
git remote add upstream git://github.com/crocodilejs/crocodile.git
```


## 2. Branch

Make sure you have installed [git-extras][git-extras].

To create a bug branch:

```bash
git-bug <name>
```

To create a chore, refactoring, cleanup branch:

```bash
git-chore <name>
```

To create a feature branch:

```bash
git-feature <name>
```

Now you can start coding!


## 3. Test

When you think your code is ready, please make sure you run tests.

```bash
npm test
```

Most importantly: **if you added new features,** then please write test(s).


## 4. Commit

Make sure you have [set up GitHub and Git so it knows your name and email][setup-github].

We abide by the [50/72 rule][50-72-rule] when writing Git commit messages.

When writing your commit message, please follow these simple four rules:

1. **First line should be not more than 50 characters.**
2. If you need to write more than one line, **keep the second line blank**, and write a brief summary on the first line.  Then on the third line you can continue writing.
3. **Wrap all other lines to 72 characters**.
4. Prefix the first line with an emoticon based off the context of your commit.  This makes the logs easier to read (and fun of course).

The emoticons to use are as follows:

Branch        | Emoticon     | Output
------------- | :----------: | ------
`git-bug`     | `:bug:`      | :bug:
`git-chore`   | `:lipstick:` | :lipstick:
`git-feature` | `:bulb:`     | :bulb:

Here's an example template for a simple one-line commit message for a bug:

```log
:bug: Fixed a bug related to true bugs
```

Here's an example template for a complex commit message related to a feature:

```log
:bulb: Added new really cool feature!

The feature includes the following items:
* New way to do XYZ
* Improved approach for ABC
* Highly refined components
```


## 5. Push

Now you've got your code in, tested, and committed &ndash; you're ready to push!

For a bug branch:

```bash
git push origin bug/<name>
```

For a chore branch:

```bash
git push origin chore/<name>
```

For a feature branch:

```bash
git push origin feature/<name>
```


## 6. Pull Request

Open a new pull-request at <https://github.com/yourusername/crocodile> **(replace with your username)** &ndash; and select your newly pushed branch.


## 7. Cleanup

After your pull-request is accepted, you can finish it out so your forked master branch is up to date:

Simply finish out branch with [git-extras][git-extras] helper commands.

If you're working on a bug branch:

```bash
git-bug finish <name>
```

If you're working on a chore, refactoring, or cleanup branch:

```bash
git-chore finish <name>
```

If you're working on a feature branch:

```bash
git-feature finish <name>
```


[50-72-rule]: https://medium.com/@preslavrachev/what-s-with-the-50-72-rule-8a906f61f09c
[setup-github]: https://help.github.com/articles/set-up-git/#setting-up-git
[git-extras]: https://github.com/tj/git-extras
