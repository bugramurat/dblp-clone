<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/bugramurat/dblp-clone">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">DBLP Clone</h3>

  <p align="center">
    A web application consisting of user and admin interfaces, adding authors and articles to the neo4j database from the admin interface, viewing the neo4j database as a table or graph and searching by author or article from both panels
    <br />
    <a href="https://github.com/bugramurat/dblp-clone"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/bugramurat/dblp-clone">View Demo</a>
    ·
    <a href="https://github.com/bugramurat/dblp-clone/issues">Report Bug</a>
    ·
    <a href="https://github.com/bugramurat/dblp-clone/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

![Screen Shot][product-screenshot]

A web application consisting of user and admin interfaces, adding authors and articles to the neo4j database from the admin interface, viewing the neo4j database as a table or graph and searching by author or article from both panels. Simply put, it's a DBLP clone.

<p align="right">(<a href="#top">back to top</a>)</p>



### Built With

* [Neo4j](https://neo4j.com)
* [neovis.js](https://github.com/neo4j-contrib/neovis.js/)
* [Node.js](https://nodejs.org/)
* [Express.js](https://expressjs.com)
* [Javascript](https://www.javascript.com)
* [XAMPP](https://www.apachefriends.org/index.html)
* [MySQL](https://www.mysql.com)
* [Bootstrap](https://getbootstrap.com)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

Make sure to you have [Visual Studio Code](https://code.visualstudio.com)

### Prerequisites

Download and install [XAMPP Control Panel](https://www.apachefriends.org/index.html) for MySQL connection

### Installation

1. Get a free API Key at [https://neo4j.com](https://neo4j.com)
2. Clone the repo
   ```sh
   git clone https://github.com/bugramurat/dblp-clone.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your url, username and password in `index.js`
   ```js
   60   const uri = "ENTER YOUR URL";
   61   const user = "ENTER YOUR USERNAME";
   62   const password = "ENTER YOUR PASSWORD";
   ```
5. Open XAMPP and enable Apache and MySQL 

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

To run it, type the following into the terminal
   ```sh
   nodemon
   ```

The website will be opened at ```http://localhost:3000```

For admin interface use ```http://localhost:3000/admin/login```

For user interface use ```http://localhost:3000/users/login```

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/bugramurat/dblp-clone/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.md` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Bugra Murat - bugramurat.q@gmail.com

Project Link: [https://github.com/bugramurat/dblp-clone](https://github.com/bugramurat/dblp-clone)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Neo4j clauses](https://neo4j.com/docs/cypher-manual/current/clauses/)
* [An introduction to Neo4j](https://youtu.be/IShRYPsmiR8)
* [neovis.js](https://github.com/neo4j-contrib/neovis.js/)
* [Graph visualization with Neo4j using neovis.js](https://youtu.be/0-1A7f8993M)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/bugramurat/dblp-clone.svg?style=for-the-badge
[contributors-url]: https://github.com/bugramurat/dblp-clone/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/bugramurat/dblp-clone.svg?style=for-the-badge
[forks-url]: https://github.com/bugramurat/dblp-clone/network/members
[stars-shield]: https://img.shields.io/github/stars/bugramurat/dblp-clone.svg?style=for-the-badge
[stars-url]: https://github.com/bugramurat/dblp-clone/stargazers
[issues-shield]: https://img.shields.io/github/issues/bugramurat/dblp-clone.svg?style=for-the-badge
[issues-url]: https://github.com/bugramurat/dblp-clone/issues
[license-shield]: https://img.shields.io/github/license/bugramurat/dblp-clone.svg?style=for-the-badge
[license-url]: https://github.com/bugramurat/dblp-clone/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/bugramurat
[product-screenshot]: images/screenshot.png
