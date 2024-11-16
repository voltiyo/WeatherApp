import "./app.css";

let icon = "";



async function retrieveData(city_name: any,country: any){
    LoaderOn()
    let main_temp = document.getElementById("main-temp");
    let reel_feel = document.getElementById("reel-feel")
    let wind = document.getElementById("wind");
    let rain = document.getElementById("rain");
    let UV = document.getElementById("UV");
    let main_name = document.getElementById("city-name");
    let icon_container = document.getElementById("main-icon");
    const forecast_list = document.getElementById("day-forecast-list");


    await fetch(`https://api.weatherbit.io/v2.0/current?&city=${city_name},${country}&key=${import.meta.env.VITE_WEATHER_BIT}&include=minutely`).then(response => response.json())
    .then((data) => {
        data = data.data[0]
        if(UV && wind && main_name && main_temp && reel_feel && rain && icon_container){
            wind.innerHTML = parseFloat(data.wind_spd) + " Km/h";
            UV.innerHTML = data.uv;
            main_temp.innerHTML = parseInt(data.temp) + "°";
            reel_feel.innerHTML = parseInt(data.app_temp) + "°";
            rain.innerHTML = data.precip + " mm/h"; 
            main_name.innerHTML = data.city_name;
            icon = `<img class="main-ico" src='https://www.weatherbit.io/static/img/icons/${data.weather.icon}.png'/>`;
            icon_container.innerHTML = icon;
        }
    })

    await fetch(`https://api.weatherbit.io/v2.0/forecast/hourly?&city=${city_name},${country}&key=${import.meta.env.VITE_WEATHER_BIT}&hours=12`)
    .then(Response => Response.json())
    .then((data)=>{
        data = data.data
        forecast_list.innerHTML = "";
        data.forEach((element: { timestamp_local: any; temp: any;  weather: any;}) => {
            let timestamp = element.timestamp_local;
            let date = new Date(timestamp);
            let hour = date.getHours();
            let temp = element.temp;
            
            if (forecast_list){
                let li = `<li><span>${hour}:00</span><img src='https://www.weatherbit.io/static/img/icons/${element.weather.icon}.png' /><p className='hour-degrees'>${temp}°</p></li>`
                forecast_list.innerHTML += li;
            }
        });
    })
    LoaderOff()
}
function autocomplete(){
    const apiKey = import.meta.env.VITE_CITY_SEARCH_KEY;  // Replace with your OpenCage API key
    const input = document.getElementById('search-input');

    const query = (input as HTMLInputElement).value;
    const display = document.getElementById("results")
    
    if (query.length > 2 && display) {  // Only search if query is more than 2 characters
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}&no_annotations=1&language=en`)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    // Filter out non-city results based on type
                    const cities = data.results.filter((result: { components: { city: any; town: any; village: any; }; }) => result.components.city || result.components.town || result.components.village);

                    // Extract city names (you can customize this part if you need more information)

                    display.innerHTML = "";
                    cities.forEach((element: { formatted: string; components: { _normalized_city: any; country_code: any; }; }) => {
                        let li = document.createElement("li")
                        li.innerText = element.formatted;
                        li.classList.add("search-item");
                        li.addEventListener("click", ()=>{
                            retrieveData(element.components._normalized_city,element.components.country_code)
                            localStorage.clear()
                            let storage_data : {city: any, country : any} = {
                                city : element.components._normalized_city,
                                country : element.components.country_code
                            }
                            let formatted_data = JSON.stringify(storage_data)
                            localStorage.setItem("data", formatted_data)
                            input ? (input as HTMLInputElement).value= "" : "";
                            display.innerHTML = "";
                        })
                        
                        display.appendChild(li)
                    });
                }
            })
            .catch(err => console.error('Error fetching data:', err));
        }
    else if (query.length === 0 && display){
        display.innerHTML = "";

    }



}
function LoaderOn(){
    let loader_cont = document.querySelector(".loader-cont");
    loader_cont ? (loader_cont as HTMLElement).style.visibility = "visible": "";
}
function LoaderOff(){
    let loader_cont = document.querySelector(".loader-cont");
    loader_cont ? (loader_cont as HTMLElement).style.visibility = "hidden" : "";
}

async function loaddata(){
    LoaderOn()
    if (localStorage.length > 0){
        let data : {city:any,country:any} = JSON.parse(localStorage.getItem("data"));
        let city = data.city
        let country = data.country;

        await retrieveData(city,country);
    }
    LoaderOff()
}

export default function App(){
    window.onload = loaddata;
    return(
        <div className="container">
            
            <div className="loader-cont">
                <span className="loader"></span>
            </div>

            <input type="text" placeholder="Search for cities" className="search" id="search-input" onInput={autocomplete} autoComplete="off"/>
            <div className="search-items" id="search-items">
                <ul id="results">

                </ul>
            </div>
            <div className="main-sect">
                <div className="main-text">
                    <h2 id="city-name"></h2>
                    <div className="main-temp" id="main-temp">
                        
                    </div>
                </div>
                <div className="main-icon" id="main-icon">
                    
                </div>
            </div>
            <div className="day-forecast">
                    <h3>TODAY'S FORECAST</h3>
                    <ul className="day-forecast-list" id="day-forecast-list">
                    </ul>
            </div>
            <div className="air-conditions">
                <div className="feel air-container">
                    <div className="air-element">
                        <i className="bi bi-thermometer-half"></i>
                        <h3>Reel Feel</h3>
                    </div>
                    <span id="reel-feel"></span>
                </div>
                <div className="wind air-container">
                    <div className="air-element">
                        <i className="bi bi-wind"></i>
                        <h3>Wind</h3>
                    </div>
                    <span id="wind"></span>
                </div>
                <div className="rain air-container">
                    <div className="air-element">
                        <i className="bi bi-droplet-fill"></i>
                        <h3>Precipitations</h3>
                    </div>
                    <span id="rain"></span>
                </div>
                <div className="UV air-container">
                    <div className="air-element">
                        <i className="bi bi-brightness-high"></i>
                        <h3>UV Index</h3>
                    </div>
                    <span id="UV"></span>
                </div>
            </div>
        </div>
    )
}