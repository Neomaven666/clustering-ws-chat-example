For development purposes you can create a self-certified certificate. Here's how to do it on a linux-based system:

First, generate a private key

openssl genrsa 1024 > key.pem

This will store a 1024 bit RSA key in the file key.pem

Then, generate an SSL certificate with that key:

openssl req -x509 -new -key key.pem > key-cert.pem

Now, you can use key.pem and key-cert.pem in the options you pass to createServer.