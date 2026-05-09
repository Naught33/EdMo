//imports
import { services } from "./servicelist.js";
//DOM elements

const header = document.querySelector("header");
const logo = document.querySelector(".logo");
const heroTitle = document.querySelector(".hero h1");

//function defs
const observer = new IntersectionObserver(
        ([entry]) => {

            // When hero h1 scrolls under the header
            if (!entry.isIntersecting) {
                logo.classList.add("blurred");
            } else {
                logo.classList.remove("blurred");
            }

        },
        {
            threshold: 0,

            // Adjust based on header height
            rootMargin: `-300px 0px 0px 0px`
        }
    );

//function calls
if(window.innerWidth > 768){
    observer.observe(heroTitle);
}


//event listeners