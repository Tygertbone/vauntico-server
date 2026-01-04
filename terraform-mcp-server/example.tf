# Example Terraform configuration for testing MCP server
resource "aws_instance" "example" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
  
  tags = {
    Name = "ExampleInstance"
  }
}

resource "aws_s3_bucket" "example" {
  bucket = "example-bucket-name"
  
  tags = {
    Name = "ExampleBucket"
  }
}
