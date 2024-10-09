FROM rust:1-bookworm

RUN curl -L https://install.dojoengine.org | bash
RUN bash -c "source /root/.bashrc && dojoup -v 0.6.0"

CMD /root/.dojo/bin/katana --db-dir /data --invoke-max-steps 4500000
