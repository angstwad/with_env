# with_env

Allows you to set up a shell environment from a JSON file in S3.

## Why?

I needed to run ECS containers with environment variables, some potentially sensitive.

Running an app in a container with with environment variables is easy, but it's difficult to
hide if you're setting secrets in the environment.  This allows you to define your app config
with environment variables (and potentially secrets) from a JSON file in S3 which is loaded
dynamically when a container starts.

## Install

```
git clone https://github.com/angstwad/with_env.git
cd with_env
npm install
```

## Example

Bash script:
```
#!/bin/bash

eval $(node with_env.js --bucket mybucket --file env.json)

exec $@
```

