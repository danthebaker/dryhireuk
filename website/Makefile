.PHONY: install build digger

install:
	npm install
	cd www/admin/app/warehouse && component install
	cd www/app/dryhire && component install

build: digger
	cd www/admin/app/warehouse && component build -c
	cd websiteold/www/app/dryhire && component build -c

digger:
	mkdir -p www/admin/app/build
	browserify -s "diggerfactory" \
		-r digger-app > www/admin/app/build/digger.js
	