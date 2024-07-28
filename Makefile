# Variables

BIN := ./node_modules/.bin

# Rules

install:
	npm install

infra:
	docker-compose up -d --force-recreate

infra-stop:
	docker-compose stop

infra-restart: infra-stop infra

develop:
	${BIN}/nodemon --watch src

server:
	node --max_old_space_size=1024 ./src/index.js --trace-warnings

.PHONY:
	install
	infra
	infra-stop
	infra-restart
