dev:
  zensical serve -f zensical.yml

[macos]
preview:
  zensical serve -a $(ipconfig getifaddr en0):8080 -f zensical.yml

build:
  zensical build -f zensical.yml --clean

deploy: build
  npx wrangler pages deploy site --project-name=codexy --commit-dirty=true
