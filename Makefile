target=$(shell jq -r .deploy_target src/pages.json)

.PHONY: deploy
deploy: build
	rsync --chmod=D0755,F0644 --perms -rP build/ $(target)

.PHONY: build
build:
	npm run build
