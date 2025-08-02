FROM mcr.microsoft.com/devcontainers/typescript-node:18

# パッケージのインストール
RUN apt update
RUN apt install -y locales
RUN locale-gen ja-JP.UTF-8 
RUN apt-get update && apt-get install -y locales tzdata && \
    locale-gen ja_JP.UTF-8 && \
    localedef -f UTF-8 -i ja_JP ja_JP && \
    ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata
WORKDIR /workspace

ENV LANG=ja_JP.UTF-8
ENV LANGUAGE=ja_JP:jp
ENV LC_ALL=ja_JP.UTF-8
ENV TZ=Asia/Tokyo

# gitの署名無効化
RUN git config --global commit.gpgSign false

RUN corepack enable && corepack prepare pnpm@latest --activate