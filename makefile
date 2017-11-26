VERSION=0.4.1
DOCKERIMAGE=micheldebree/retroframes:$(VERSION)
DOCKERCMD=docker run -t --rm -v "$$PWD":/data $(DOCKERIMAGE)
LOCALCMD=node index.js

run: dockerimage
	docker run --rm -it -v "$$PWD":/data $(DOCKERIMAGE)

node_modules:
	npm install

dockerimage: node_modules
	docker build -t $(DOCKERIMAGE) .

docker_debug: dockerimage
	docker run -it --entrypoint /bin/sh $(DOCKERIMAGE)

clean:
	rm -rf tmp-*/

