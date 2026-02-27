project := "codexy"
config := "zensical.yml"
output := "site"

dev:
  zensical serve -f {{ config }}

[macos]
preview:
  zensical serve -a $(ipconfig getifaddr en0):8080 -f {{ config }}

build:
  zensical build -f {{ config }} --clean

deploy: build
  {{ if env("CI", "false") == "true" {
      f'wrangler pages deploy {{ output }} --project-name={{ project }}'
    } else {
      f'npx wrangler pages deploy {{ output }} --project-name={{ project }} --commit-dirty=true'
    } }}
