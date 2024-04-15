FROM centos:7
RUN yum update -y && yum clean all
RUN yum install -y yum group install -y "Development Tools" 
RUN yum install -y epel-release 
RUN curl -C - -O https://cmake.org/files/v3.28/cmake-3.28.0-linux-x86_64.tar.gz && \ 
                tar xzf cmake-3.28.0-linux-x86_64.tar.gz && \ 
                    ln -s $PWD/cmake-3.28.0-linux-x86_64/bin/cmake /usr/bin/cmake
RUN yum install -y openssh-server openssh-clients centos-release-scl-rh wget which
RUN yum install -y devtoolset-11 devtoolset-11-toolchain devtoolset-11-gcc-c++
ENV PATH="/opt/conda/bin:$PATH"
RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh && \
    bash miniconda.sh -b -p /opt/conda && \
    rm miniconda.sh
RUN conda create -y --name py38 python=3.8
ENV PATH="/opt/conda/envs/py38/bin:$PATH"
ENV CC=/opt/rh/devtoolset-11/root/usr/bin/gcc
ENV CXX=/opt/rh/devtoolset-11/root/usr/bin/g++
RUN wget https://nodejs.org/dist/v20.11.0/node-v20.11.0.tar.xz && tar -xf node-v20.11.0.tar.xz
RUN cd node-v20.11.0 && scl enable devtoolset-11 bash && ./configure --prefix=/usr && make -j2
RUN cd node-v20.11.0 && make install
RUN rm -rf node-v20.11.0 cmake-3.28.0-linux-x86_64.tar.gz miniconda.sh && yum clean all
ENV LC_ALL=en_US.utf-8
ENV LANG=en_US.utf-8
ENTRYPOINT ["/bin/bash"]
