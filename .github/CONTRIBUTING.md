# Contributing to Evaluator

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

## Table of Contents

* [I Have a Question](#i-have-a-question)
* [I Want To Contribute](#i-want-to-contribute)
    * [How Do I Submit a Bug Report or Feature Request?](#how-do-i-submit-a-bug-report-or-feature-request)
  * [Your First Code Contribution](#your-first-code-contribution)
  * [Improving The Documentation](#improving-the-documentation)
* [Styleguides](#styleguides)
  * [Issues](#issues)
  * [Branches](#branches)
  * [Pull Requests](#pull-requests)


## I Have a Question

Before you ask a question, it is best to search for existing [Issues](https://github.com/maxi-smidt/evaluator/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/maxi-smidt/evaluator/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.

We will then take care of the issue as soon as possible.

## I Want To Contribute

> ### Legal Notice
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project licence.

#### How Do I Submit a Bug Report or Feature Request?

Open a new [Issue](https://github.com/maxi-smidt/evaluator/issues/new) and describe it as good as possible. In case of a bug, provide the information and environment necessary to recreate it.

### Your First Code Contribution

Look at the [Getting Started Guide](./GETTING_STARTED.md) to see how to set up the application.

### Improving The Documentation

It is highly encouraged to start superficial documentation in the GitHub Wiki and also _in-code_ documentation such as `pydoc` and OpenAPI.

## Styleguides

Issues, Branches and PR's should follow naming and content guides:

### Issues

Issues should have a title following the convention `<LABEL>: <Short description>` with `LABEL` being one of _Bug_, _Documentation_ or _Feature_ (e.g., _Feature: This is a very important thing_).

The _Short description_ should summarize the content of the issue. The content should allow to recreate bugs or see where a feature should be going.

### Branches

For branches you should follow the naming convention `<USER_ID>/<LABEL>/<Short description>` (e.g., _msmidt/bug/123-this-is-a-bug_). The _USER_ID_ can be, but not necessarily must be your GitHub username, the label is one of the options already mentioned in [Issues](#issues) **but in lowercase**. It is recommended that the _Short description> starts with issue number for easier navigation. 

### Pull Requests

PR's should be titles following the convention `[<LABEL> #<ISSUE_NUMBER>] <Short description>`. Labels is one of the options mentioned in [Issues](#issues) or _NOISSUE_ for quickfixes (e.g., _[Feature #123] this is a very important thing_). The _ISSUE_NUMBER_ is the id of the related issue and written with a _#_ in before it automatically links from the PR to the issue. In case of _NOISSUE_, no issue id can be provided (e.g., _[NOISSUE] this is a quickfix_).

PR's always need to be approved by one of the code maintainers. Commits are squashed before merging - therefore the commit messages are not too important, but still give information about the contents. The branch is automatically deleted after the merge.

## Attribution
This guide is based on the [contributing.md](https://contributing.md/generator)!