# Local CI Testing with Act

This project uses [act](https://github.com/nektos/act) to run GitHub Actions workflows locally for faster feedback during development.

## Installation

### macOS (Homebrew)
```bash
brew install act
```

### Linux
```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### Windows (with Chocolatey)
```bash
choco install act-cli
```

Or download from [GitHub Releases](https://github.com/nektos/act/releases).

## Prerequisites

- **Docker Desktop** must be running
- **Bun** should be available (or will be installed by the workflow)

## Usage

### Using npm scripts (recommended)

```bash
# Run all CI workflows
bun run ci

# Run only test job
bun run ci:test

# Run only lint job
bun run ci:lint

# List all available jobs
bun run ci:list

# Dry run (shows what would be executed)
bun run ci:dry-run
```

### Using act directly

```bash
# Run all workflows
act

# Run specific job
act -j test
act -j lint

# List all jobs
act -l

# Dry run
act -n

# Run with verbose output
act -v
```

## Configuration

The `.actrc` file in the project root contains default configuration:
- Uses `catthehacker/ubuntu:act-latest` Docker image (medium size, ~500MB)
- Sets `linux/amd64` architecture for Apple Silicon compatibility

### Custom Configuration

You can override defaults by creating a local `.actrc` file in your home directory:
```bash
# ~/.actrc or $HOME/Library/Application Support/act/actrc (macOS)
-P ubuntu-latest=catthehacker/ubuntu:act-latest
--container-architecture linux/amd64
```

Or pass options directly to act:
```bash
act -P ubuntu-latest=catthehacker/ubuntu:act-22.04-full  # Use full image
act --container-architecture linux/arm64                  # Use ARM architecture
```

## Common Workflows

### Test changes before pushing
```bash
# Full CI check
bun run ci

# Or run individual jobs
bun run ci:lint
bun run ci:test
```

### Debug failing CI
```bash
# Run with verbose output
act -v -j lint

# Run specific workflow file
act -W .github/workflows/ci.yml
```

### Clean up Docker resources
```bash
# Remove act containers
docker ps -a | grep act | awk '{print $1}' | xargs docker rm

# Remove act images (if needed)
docker images | grep act | awk '{print $3}' | xargs docker rmi
```

## Tips

1. **First run takes time** - Docker pulls the image (~500MB for medium size)
2. **Subsequent runs are fast** - Docker caches the image and layers
3. **Use dry-run first** - `bun run ci:dry-run` to see what will execute
4. **Secrets** - act uses `.secrets` file if you need to test with secrets (not needed for this project)

## Differences from GitHub Actions

- **No GitHub API access** - Some GitHub-specific actions may not work
- **Local file system** - Uses your local checkout, not a fresh clone
- **Environment** - Minor differences in environment variables and available tools

## Troubleshooting

### Docker not running
```
Error: Cannot connect to the Docker daemon
```
**Solution**: Start Docker Desktop

### Permission denied
```
Error: permission denied while trying to connect to the Docker daemon socket
```
**Solution**: Add your user to the docker group or run with sudo

### Out of disk space
```
Error: no space left on device
```
**Solution**: Clean up Docker resources (see "Clean up Docker resources" above)

### Architecture mismatch (Apple Silicon)
Already handled by `.actrc` configuration. If you still see issues:
```bash
act --container-architecture linux/amd64
```

## Resources

- [act Documentation](https://nektosact.com/)
- [GitHub Actions Local Runner](https://github.com/nektos/act)
- [Docker Images for act](https://github.com/catthehacker/docker_images)
