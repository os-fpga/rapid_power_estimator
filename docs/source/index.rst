Welcome to Rapid Power Estimator's Documentation!
=================================================

Introduction
============

Power and thermal specifications are critical considerations in the early stages of designing SoCs and FPGAs. Determining accurate power requirements and cooling solutions is essential to avoid over-designing or under-designing your product's power and thermal systems. It is a valuable tool in this process.

RPE allows you to estimate power consumption at various stages of your design cycle. It simplifies the input of design information through intuitive wizards and delivers comprehensive power and thermal data analysis.

History
=======

The Power Estimator tool was first designed and developed by Brian (who has since left the company) using an Excel spreadsheet. Over time, the Excel sheet's design became slower and more cumbersome as development progressed, with an increasing number of macros, functions, and data being added to the spreadsheet. This negatively impacted scalability and long-term maintenance.

GUI Design and Technology Choices
=================================

To craft an aesthetically pleasing and contemporary GUI, leveraging web technologies like HTML and CSS is a fitting choice for the design. While web technologies are a tried-and-true tech stack with cross-platform compatibility across Windows, Linux, and macOS, there are certain considerations to keep in mind. One significant challenge is that the software engineers within the company may not possess expertise in web technologies like HTML, CSS, and JavaScript.

Furthermore, the internet offers a plethora of free software frameworks, including Electron.js, React.js, Angular.js, Vue.js, etc., each boasting its strengths and weaknesses. This wide array of choices necessitates a careful evaluation of which framework aligns best with our project goals.

On the backend side, we have a range of options, such as C#.NET, Python, Node.js, and C++, offering flexibility in crafting the backend architecture. Exploring these possibilities and determining how to seamlessly integrate frontend and backend components is a critical aspect of our project.

The importance of a proof of concept cannot be overstated. It serves as a crucial milestone to ensure that our software not only functions as intended but is also prepared for production deployment. During this phase, we can assess the suitability of our chosen technologies, validate the frontend-backend connection, and verify that our software is ready for real-world use.

Contents
========

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   installation
   usage
   api_reference

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
