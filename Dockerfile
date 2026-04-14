FROM python:3.9-slim

# Cài đặt các thư viện hệ thống cần thiết cho xử lý ảnh
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Copy requirements và cài đặt
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy toàn bộ mã nguồn và model
COPY . .

# Specify default command
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]