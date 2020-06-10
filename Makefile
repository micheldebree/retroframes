IMAGE=micheldebree/retroframes
VERSION=0.1.4
DOCKERIMAGE=$(IMAGE):$(VERSION)

dockerimage:
	docker build -t $(DOCKERIMAGE) .
	docker tag $(DOCKERIMAGE) $(IMAGE):latest

docker_debug: dockerimage
	docker run -it --entrypoint /bin/sh $(DOCKERIMAGE)

release: dockerimage
	git tag $(VERSION)
	git push
	git push --tags

clean:
	rm -rf ./app/tmp-*/
	rm -rf ./app/node_modules

test:
	node ./app/index.js magnum_short.mp4
