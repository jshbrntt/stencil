This purpose of this tutorial is to explain how to perform a "release" using this project.

## Steps

1. Run `git pull --all` so that you get the latest changes for both `develop` and `master` branches from `origin`.

2. Checkout the `develop` branch and check it  represents what you want in the next release.

3. Run `git flow release start X.Y.Z` where `X.Y.Z` is the next logical [semantic version number][semver].

4. Update the version number in `package.json` to be `X.Y.Z`.

5. Add to `CHANGELOG.md` a new header for the new `X.Y.Z` release.

6. Create a corresponding `/compare` link for this new header (see the bottom of the file).

7. Add meaningful notes following the format outlined [here][keepachangelog], under the new header.

8. `git add` the changes made to `package.json` and `CHANGELOG.md`.

9. `git commit` these changes with a message of `X.Y.Z`.

10. Run `git flow release finish X.Y.Z`, and save all the corresponding commit messages that come up.

11. Push the newly created `X.Y.Z` tag and the local state of your `develop` and `master` branches.

```shell
git push origin develop master X.Y.Z
```

## Walkthrough

[![asciicast](https://asciinema.org/a/fKWzVg2FVd6ITeMYK65EpItUK.png)](https://asciinema.org/a/fKWzVg2FVd6ITeMYK65EpItUK)

[keepachangelog]: https://keepachangelog.com/en/1.0.0/
[semver]:         https://semver.org/spec/v2.0.0.html
