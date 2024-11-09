# Contributing to Evaluator

Contributions to this project are highly appreciated. In order to keep quality some guidelines need to be followed.

## Naming Conventions

### Branches
Branches should named like "type/issue_number" with type being one of "feature", "bug", "documentation" or "noissue". The issue_number is the number of the issue that is resolved with this branch. If there is no issue, the number can be left out.

e.g. feature/42

### Merge Requests
Merge requests should be titled as "[type #issue_number] short_description" with type being either "Feature", "Documentation", "Bug" or "NOISSUE". The issue_number is the number of the issue that is resolved via the MR. If there is no issue, the number can be left out.  

e.g. [Feature #42] plagiarism site implementation, [NOISSUE] ci/cd workflow quick fix

### Commit messages
Commit messages are not further important, because all the commits are squashed anyway.

## Coding
To retain a specific code quality, linting is used for both frontend (EsLint) and backend (pylint). Since this is not yet checked in the CI/CD workflow, it should be checked, before changes are merged.
