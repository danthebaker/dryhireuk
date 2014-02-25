.PHONY: install app templates link

install:
	cd website && npm install
	cd website/www/app/dryhire && component install

build:
	cd website/www/app/dryhire && component build
	
templates:
	#cd website/www/app/dryhire && component convert templates/shop.html

link: install
	rm -rf website/www/app/dryhire/components/binocarlos-ng-toptrump
	ln -s /srv/projects/ng-toptrump website/www/app/dryhire/components/binocarlos-ng-toptrump

build: app

developer:
	quarry developer dryhire
	