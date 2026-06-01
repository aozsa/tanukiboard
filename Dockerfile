FROM node:22.22.0

ENV LANG ja_JP.utf8
ENV TZ=Asia/Tokyo

WORKDIR /app
COPY . /app
RUN yarn install

CMD ["sh", "run.sh"]