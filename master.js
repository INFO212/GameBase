//Global variabel (guid i JSON)
let gameID;


$(document).ready(function () {

    /*------------------------------------------------ FUNKSJONER-------------------------------------------------------- */

    /**
     * Sender request
     * @param resource fra API. Eks. game, search o.l.
     * @param data fra API. Verdier i JSON
     * @param callback respons fra server
     */
    function sendRequest(resource, data, callback) {
        const baseURL = 'http://giantbomb.com/api';
        const apiKey = '71a7d36bfb3ae29d418d3ffc3b7dcd3f2c7ff39b';
        const format = 'json';

        data = data || {};


        //Setter sammen URL
        let urlString, tmpArray = [], filters;
        $.each(data, function (key, value) {
            urlString = key + '=' + value;
            tmpArray.push(urlString);
        });


        filters = (tmpArray.length > 0) ? '&' + tmpArray.join('&') : '';

        // URL for request
        let requestURL = baseURL + resource + "?api_key=" + apiKey + "&format=" + format + filters;


        //GET-request
        $.ajax({
            url: requestURL,
            method: 'GET',
            dataType: 'json',

            success: function (response) {
                callback.success(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                callback.error(jqXHR);
                console.log(textStatus, errorThrown);
            }
        });
    }


    /**
     * Laster spill
     * @param data av hvert spill
     */
    function loadGames(data) {
        $('#grid').html('');
        sendRequest('/games/', data, {

            success: function (data) {

                $.each(data.results, function (key, value) {

                    //Henter navn fra alle platformer
                    let allPlatforms = '';
                    $.each(value.platforms, function (key, value) {
                        allPlatforms += value.name;
                    });

                    ///Sjekker om spill har beskrivelse
                    if (value.deck == null || value.deck.length <= 3) {
                        value.deck = "Ingen beskrivelse";
                    }

                    let gameData = '';
                    gameData += '<div class="box">';

                    gameData += '<div class="game_cover">';
                    gameData += '<img src="' + this.image.small_url + '">';
                    gameData += '</div>';

                    gameData += '<div class="game_info">';
                    gameData += value.name + '<br>';
                    gameData += '<p class="date">' + checkDate(value.original_release_date, value.expected_release_year) + '</p>';
                    gameData += '</div>';

                    gameData += '<div class="hover_info">';
                    gameData += '<div class="desc">' + value.deck + '</div>';
                    gameData += '<div class="logoContainer">' + showPlatforms(allPlatforms) + '</div>';
                    gameData += '</div>';

                    gameData += '</div>';

                    $('#grid').append(gameData);

                });
            }
        });
    }


    /**
     * Henter data fra spill
     * @param gameID guid fra hvert spill i søkeresultatet
     */
    function getGame(gameID) {


        let data = {
            field_list: 'name,deck,platforms,similar_games,images,original_release_date,expected_release_year,developers'
        };


        sendRequest('/game/' + gameID + '/', data, {

            success: function (data) {


                $('#title').html('');
                $('#imgRow').html('');
                $('#gameinfo').html('');


                $.each(data, function (key, value) {


                    //Henter navn på tilgjengelige platformer
                    let platformz = "";
                    $.each(value.platforms, function (key, value) {
                        platformz += value.name;
                    });

                    let simGames = "";
                    $.each(value.similar_games, function (key, value) {
                        simGames += value.name;

                    });


                    let imgList = "";
                    $.each(value.images, function (key, value) {
                        imgList += '<img src="' + value.icon_url + '">';

                    });

                    //Container med bilder av spill
                    let imgContainer =
                        '<div class="imgCol">' + imgList + '</div>';


                    let devs = '';
                    $.each(value.developers, function (key, value) {
                        devs += value.name;
                    });


                    //Liste med resultater for søk


                    let str = '<div class="gameDescription">';
                    str += '<div>' + value.deck + '</div>';
                    str += '<div>' + platformz + '</div>';
                    str += '<div>' + simGames + '</div>';
                    str += '<div>' + checkDate(value.original_release_date, value.expected_release_year) + '</div>';
                    str += '<div>' + devs + '</div>';
                    str += '</div>';


                    $('#title').html(value.name);
                    $('#imgRow').append(imgContainer);
                    $('#gameinfo').append(str);

                });

            }
        });
    }



    /*-------------------------------------------------- EVENTS---------------------------------------------------------- */


    /**
     * Event for åpning av responsive meny
     */


    $('.meny').on('click', function () {
        let x = document.getElementById("nav");
        if (x.className === "navbar") {
            x.className += " responsive";
        } else {
            x.className = "navbar";
        }
    });


    /**
     * Events for søk av spill
     */

    $('.searchIcon').on('click', function () {
        $('#searchOverlay').show();
    });

    $('.close').on('click', function () {
        $('#searchOverlay').hide();
    });

    $('#searchOverlay').on('keyup', function (e) {
        if (e.keyCode === 27) { $('#searchOverlay').hide();}
    });

    $('#result').on('click', function () {
        $('#searchOverlay').hide();
    });


    /**
     * Event for søk og visning av resultater
     */
    $('.searchField').keyup(function () {
        let searchString = $(this).val();

        $('#result').html('');

        //Felter som skal søkes etter
        let data = {
            query: searchString,
            resources: 'game'
        };

        sendRequest('/search', data, {

            success: function (data) {

                //Tabell for søkeresultater
                let table = '<table id="searchResults">';

                $.each(data.results, function (key, value) {

                    let platform = "";
                    $.each(value.platforms, function () {
                        platform += '  •  ' + this.name;
                    });

                    table += '<tr class="gameLink" data-href="' + value.guid + '">';
                    table += '<td>';
                    table += '<img src="' + this.image.icon_url + '">';
                    table += '</td>';

                    table += '<td class="gameText">';
                    table += '<h4>' + value.name + '</h4>';
                    table += platform;
                    table += '</td>';

                    table += '<td>';
                    table += checkDate(value.original_release_date, value.expected_release_year);
                    table += '</td>';

                });
                table += '</table>';

                //Foreløpig løsning. Legger til data om spill i result når man trykker på spillet
                $('#result').html(table).on('click', '.gameLink', function () {

                    gameID = $(this).attr('data-href');

                    $('#result').html('');

                    getGame(gameID);
                    console.log(gameID);



                });
            }
        });
    });


    /**
     * Events for samling av spill
     */

        //Default: laster de 50 nyeste spillene for alle konsoller
    let data = {
            filter:'original_release_date:1701-01+00:00:00|' + getToday() + '+00:00:00',
            sort:'original_release_date:desc',
            limit:'50'
        };
    loadGames(data);


    //Se default
    $('#all').on('click',function () {
        loadGames(data);
    });

    // ID til platformer
    const ps4 = 'platforms:146';
    const xbox = 'platforms:145';
    const pc = 'platforms:94';
    const ninSwitch = 'platforms:157';

    //Laster nyeste spill for hver enkel platform ved bruk av data som sendes til loadGames
    $('#ps4').on('click', function () {
        let data = {
            filter: ps4 + ',original_release_date:1701-01+00:00:00|' + getToday() + '+00:00:00',
            sort: 'original_release_date:desc',
            limit: '50'
        };
        loadGames(data);
    });


    $('#xbox').on('click', function () {

        let data = {
            filter: xbox + ',original_release_date:1701-01+00:00:00|' + getToday() + '+00:00:00',
            sort: 'original_release_date:desc',
            limit: '50'
        };
        loadGames(data);
    });


    $('#pc').on('click', function () {

        let data = {
            filter: pc + ',original_release_date:1701-01+00:00:00|' + getToday() + '+00:00:00',
            sort: 'original_release_date:desc',
            limit: '50'
        };
        loadGames(data);
    });


    $('#switch').on('click', function () {

        let data = {
            filter: ninSwitch + ',original_release_date:1701-01+00:00:00|' + getToday() + '+00:00:00',
            sort: 'original_release_date:desc',
            limit: '50'
        };
        loadGames(data);
    });


    /**
     * Events for sortering av spill
     */
    $('#sort').change(function () {
        let selected = $('#sort').val();

        if (selected === 'upcom') {
            let data = {
                filter: 'expected_release_year:2019',
                limit: '50'
            };
            loadGames(data);
        } else if (selected === 'newest') {
            let data = {
                filter:'original_release_date:1701-01+00:00:00|' + getToday() + '+00:00:00',
                sort:'original_release_date:desc',
                limit:'50'
            };
            loadGames(data);
        }
    });


    /**
     * Events for skifting av platform og visning
     */

        //Event for å skifte platform i meny
    let platformLinks = document.getElementsByClassName("link");
    for (let i = 0; i < platformLinks.length; i++) {
        platformLinks[i].addEventListener("click", function(){
            let current = document.getElementsByClassName("current");
            current[0].className = current[0].className.replace(" current", "");
            this.className += " current";
        });
    }

    //Event for å skifte visning for spill
    let containr = document.getElementById("viewContainer");
    let buttons = containr.getElementsByClassName('view');
    for (let x = 0; x < buttons.length; x++) {
        buttons[x].addEventListener('click', function(){
            let current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }

    $('#listView').on('click', function() {
        $("#grid").css("display","block");
    });


    $('#gridView').on('click', function() {
        $("#grid").css("display", "flex");
    });


    /**
     * Filtrering av spill i listen
     */

    $("#gameSearch").on('keyup',function() {

        let value = $(this).val().toLowerCase();
        $("#grid").find(".box").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });


});


/*----------------------------------------------HJELPEFUNKSJONER----------------------------------------------------- */



/**
 * Fjerner klokkeslett fra release date og fikser format til dd/mm/yyyy
 * @param relDate original_release_date i JSON
 */
function convertDate(relDate) {

    let releaseDate = relDate.substr(0, 10);

    let newDate = releaseDate.split("-");
    newDate.reverse();
    releaseDate = newDate.join("/");

    return releaseDate;
}


/**
 * Sjekker om datoer for spill
 * @param released original_release_date i JSON
 * @param expected expected_release_year i JSON
 */
function checkDate(released, expected) {
    if (released == null && expected !== null) {
        return '(' + expected + ')';
    } else if (released !== null && expected == null) {
        return convertDate(released);
    } else if(released == null && expected == null) {   //Hvis spill ikke har release eller expected date
        return "Ingen info";
    }
}


/**
 * Får dagens dato som brukes for å laste nyeste spill automatisk
 */
function getToday() {
    let d = new Date;
    let today = '';

    today +=d.getFullYear() + '-';
    today +=d.getMonth()+1 + '-';
    today +=d.getDate();

    return today;
}

/**
 * Legger til ikoner av platformene et spill er tilgjenglig på
 * @param input
 * @returns {string}
 */
function showPlatforms(input) {

    let platforms = '';

    if (input.includes('PlayStation 4')) {
        platforms += '<img src="img/ps4.png" class="logo">';
    }

    if (input.includes('Xbox One')) {
        platforms += '<img src="img/xboxOne.png" class="logo">';
    }

    if (input.includes('Switch')) {
        platforms += '<img src="img/switch.png" class="logo">';
    }

    if (input.includes('PC')) {
        platforms += '<img src="img/win10.png" class="logo">';
    }

    if (input.includes('PlayStation 3' && 'PlayStation Network (PS3)')) {
        platforms += '<img src="img/ps3.png" class="logo">';
    }

    if (input.includes('Xbox 360')) {
        platforms += '<img src="img/xbox360.png" class="logo">';
    }

    if (input.includes('Wii U')) {
        platforms += '<img src="img/wiiU.png" class="logo">';
    }

    return platforms;
}






