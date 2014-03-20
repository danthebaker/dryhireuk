.PHONY: install app templates link

install:
	cd websiteold && npm install
	cd websiteold/www/app/dryhire && component install
	#cd websiteold/www/admin/app/warehouse && component install

warehouse:
#	cd websiteold/www/admin/app/warehouse && component build -c

dryhire:
	cd websiteold/www/app/dryhire && component build -c

build: digger warehouse dryhire

digger:
	#mkdir -p website/www/admin/app/build
	#cd website && browserify -s "diggerfactory" \
	#	-r digger-app > www/admin/app/build/digger.js

folders:
	@mkdir -p ./lib/build	

templates:
	#cd website/www/app/dryhire && component convert templates/shop.html

link: install
	rm -rf website/www/app/dryhire/components/binocarlos-ng-toptrump
	ln -s /srv/projects/ng-toptrump website/www/app/dryhire/components/binocarlos-ng-toptrump
	rm -rf website/www/admin/app/warehouse/components/diggerio-digger-admin
	ln -s /srv/projects/digger-admin website/www/admin/app/warehouse/components/diggerio-digger-admin

build: app

developer:
	quarry developer dryhire
	