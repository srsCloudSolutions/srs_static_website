# Use the official Nginx image as a base
FROM nginx

# Copy the directory into the container at /usr/share/nginx/html
COPY ./ /usr/share/nginx/html/

# Expose port 80 for HTTP
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
