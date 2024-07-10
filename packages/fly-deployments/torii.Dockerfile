FROM rust:1-bookworm

RUN curl -L https://install.dojoengine.org | bash
RUN bash -c "source /root/.bashrc && dojoup -v 0.6.0"

CMD /root/.dojo/bin/torii --rpc https://zenith-katana.fly.dev --world "0x645cb3e9b4d7ae1afd34d64085e61519e431c39d4811f4e6bbc5f16b66fb0" --database indexer.db