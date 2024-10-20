ARG ubuntuVersion="24.04"

FROM ubuntu:$ubuntuVersion

ARG nodeVersion="23"

RUN apt update && apt install tzdata -y
ENV TZ="Europe/Berlin"

RUN apt update && apt install -y software-properties-common htop btop curl wget git cron wget curl git vim net-tools bash-completion inetutils-ping unzip


RUN curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir './fnm' \
&& cp ./fnm/fnm /usr/bin && fnm install $nodeVersion

RUN ln -s /root/.local/share/fnm/node-versions/*/installation/bin/* /usr/local/bin/.

WORKDIR /tmp

CMD ["/bin/bash"]
