# Phoenix XShare v2.0

Phoenix XShare is a secure, open-source, and self-hostable file-sharing application built for privacy, performance, and ease of use. It is a private upload server based on [Phoenix Share](https://github.com/Pheonix14/Phoenix-Share), with enhanced features, a modern design, and improved security.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
![GitHub Repo stars](https://img.shields.io/github/stars/codedbysoumyajit/Phoenix-XShare)

## Key Features

- **Encryption Toggle**: Users can enable or disable encryption for their files before uploading, ensuring extra security and privacy.
- **No External Dependencies**: Phoenix XShare uses a local file system for storage, eliminating the need for external databases or SFTP servers, making setup simple and hassle-free.
- **User-Friendly Interface**: A sleek, intuitive design that makes file uploading and sharing effortless.
- **Modern UI**: Completely revamped with a Material You-inspired design for a fresh and responsive experience across devices.
- **Cross-Platform PWA**: Enhanced Progressive Web App support for a native-like experience on any device, with offline capabilities.
- **Lightweight & Efficient**: Optimized for speed and resource efficiency, outperforming its predecessor.
- **Enhanced Security**: Features like session encryption and on-device file encryption for maximum data protection.
- **Scalable Database**: Now powered by MongoDB for better scalability and data management (upgraded from SQLite).
- **Performance Boost**: Significant speed improvements for faster uploads, downloads, and app responsiveness.

## Prerequisites

- **Node.js (LTS version)**: Ensure Node.js is installed on your system. Download it from [here](https://nodejs.org/en) if needed.

## Run Locally

To set up and run Phoenix XShare on your local machine, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/codedbysoumyajit/Phoenix-XShare.git](https://github.com/codedbysoumyajit/Phoenix-XShare.git)
    ```

2.  **Change Directory**:
    ```bash
    cd Phoenix-XShare
    ```

3.  **Install Dependencies**:
    ```bash
    npm install
    ```

4.  **Fill the Configuration**:
    - Open the `/config/config.js` file.
    - Update the necessary configuration options, such as port, encryption toggle, domain, etc.

5.  **Start the Server**:
    ```bash
    npm run start
    ```
    You should see a message like `Phoenix XShare is running on http://localhost:3000` in your terminal.

6.  **Access the Application**:
    Open your browser and navigate to `http://localhost:3000` to start using Phoenix XShare. Upload and share files securely with ease!

## License

Phoenix XShare is licensed under the [MIT License](https://choosealicense.com/licenses/mit/). See the [LICENSE](https://github.com/codedbysoumyajit/Phoenix-XShare/blob/main/LICENSE) file for more details.

## Contribute

We welcome contributions to make Phoenix XShare even better!

## Feedback & Support

If you encounter any issues or have suggestions, please open an [issue](https://github.com/codedbysoumyajit/Phoenix-XShare/issues) or join the discussion in our community.

Built with ❤️ and lots of ☕ by Soumyajit Das.
