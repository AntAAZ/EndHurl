
import { Router, Request, Response, NextFunction } from 'express';
let borderCountries = require('./cities.json')
class NaturalEarthGetCityRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/getNaturalEarthCities', this.handleGetReq);
    }

    private handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        if(!req.isAuthenticated())
        {   
            return res.status(401).send({message: "You are not logged in"})
        }
        let cities: any = []
        let whitelisted: any = []
        let special: any = []
        whitelisted['Bulgaria'] = ['Sofia', 'Plovdiv', 'Varna']
        whitelisted['Romania'] = ['Bucharest', 'Cluj-Napoca', 'Constanța']
        whitelisted['Greece'] = ['Athens', 'Thessaloniki', 'Patra', 'Iraklio']
        whitelisted['Serbia'] = ['Belgrade', 'Niš']
        whitelisted['Kosovo'] = ['Pristina']
        whitelisted['North Macedonia'] = ['Skopje']
        whitelisted['Albania'] = ['Tirana']
        whitelisted['Montenegro'] = ['Podgorica']
        whitelisted['Bosnia and Herzegovina'] = ['Sarajevo']
        whitelisted['Croatia'] = ['Zagreb', 'Split']
        whitelisted['Slovenia'] = ['Ljubljana']
        whitelisted['Hungary'] = ['Budapest', 'Debrecen']
        whitelisted['Austria'] = ['Vienna', 'Graz']
        whitelisted['Czechia'] = ['Prague']
        whitelisted['Slovakia'] = ['Bratislava']
        whitelisted['Germany'] = ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Leipzig', 'Stuttgart']
        whitelisted['United Kingdom'] = ['London', 'Birmingham', 'Plymouth', 'Glasgow', 
            'Liverpool', 'Bristol', 'Belfast', 'Newcastle']
        whitelisted['Turkey'] = ['Ankara', 'Istanbul', 'İzmir', 'Antalya', 
            'Adana', 'Diyarbakır', 'Bursa', 'Samsun']
        whitelisted['France'] = ['Nantes', 'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Ajaccio', 'Nice']
        whitelisted['Spain'] = ['Madrid', 'Bilbao', 'Barcelona', 
            'Valencia', 'Seville', 'Palma', 'Zaragoza', 'Las Palmas']
        whitelisted['Portugal'] = ['Lisbon', 'Porto', 'Funchal', 'Ponta Delgada']
        whitelisted['Ireland'] = ['Dublin', 'Cork']
        whitelisted['Iceland'] = ['Reykjavík']
        whitelisted['Italy'] = ['Milan', 'Turin', 'Rome', 'Naples', 'Palermo', 'Cagliari', 'Bari', 'Florence']
        whitelisted['Netherlands'] = ['Amsterdam']
        whitelisted['Belgium'] = ['Brussels']
        whitelisted['Luxembourg'] = ['Luxembourg']
        whitelisted['Denmark'] = ['København', 'Århus']
        whitelisted['Norway'] = ['Oslo', 'Bergen', 'Trondheim', 'Tromsø']
        whitelisted['Sweden'] = ['Malmö', 'Stockholm', 'Göteborg', 'Umeå']
        whitelisted['Finland'] = ['Helsinki', 'Tampere', 'Oulu']
        whitelisted['Poland'] = ['Gdańsk', 'Warsaw', 'Kraków', 'Wrocław']
        whitelisted['Belarus'] = ['Minsk', 'Homyel']
        whitelisted['Estonia'] = ['Tallinn']
        whitelisted['Latvia'] = ['Riga', 'Liepaga']
        whitelisted['Lithuania'] = ['Vilnius']
        whitelisted['Malta'] = ['Valletta']
        whitelisted['Moldova'] = ['Chișinău']
        whitelisted['Ukraine'] = ['Lviv', 'Odessa', 'Kyiv', 'Kharkiv', 'Dnipro', 'Kryvyy Rih', 'Vinnytsya']
        whitelisted['Switzerland'] = ['Bern', 'Zürich']
        whitelisted['Cyprus'] = ['Nicosia']
        
        whitelisted['Japan'] = ['Tokyo', 'Ōsaka', 'Nagoya', 'Sapporo', 'Fukuoka']
        whitelisted['North Korea'] = ['Pyongyang']
        whitelisted['South Korea'] = ['Seoul', 'Busan']
        whitelisted['Mongolia'] = ['Ulaanbaatar']
        whitelisted['Taiwan'] = ['Taipei', 'Kaohsiung']
        whitelisted['Kazakhstan'] = ['Nur-Sultan', 'Almaty', 'Qaraghandy', 'Aqtobe', 'Atyrau', 'Shymkent']
        whitelisted['Vietnam'] = ['Hanoi', 'Ho Chi Minh City', 'Da Nang']
        whitelisted['Cambodia'] = ['Phnom Penh', 'Siem Reap']
        whitelisted['Laos'] = ['Vientiane']
        whitelisted['Thailand'] = ['Bangkok', 'Nakhon Ratchasima', 'Chiang Mai', 'Hat Yai']
        whitelisted['Myanmar'] = ['Naypyidaw', 'Yangon', 'Mandalay', 'Mawlamyine']
        whitelisted['Bangladesh'] = ['Chattogram', 'Dhaka']
        whitelisted['Bhutan'] = ['Thimphu']
        whitelisted['Nepal'] = ['Kathmandu']
        whitelisted['Pakistan'] = ['Karachi', 'Lahore', 'Islamabad', 'Quetta', 'Multan']
        whitelisted['Afghanistan'] = ['Kabul', 'Kandahar']
        whitelisted['Turkmenistan'] = ['Ashgabat']
        whitelisted['Tajikistan'] = ['Dushanbe']
        whitelisted['Kyrgyzstan'] = ['Bishkek', 'Osh']
        whitelisted['Uzbekistan'] = ['Tashkent', 'Samarkand', 'Namangan']
        whitelisted['Iran'] = ['Tehran', 'Mashhad', 'Isfahan', 'Tabriz', 'Shiraz']
        whitelisted['Iraq'] = ['Baghdad', 'Mosul', 'Basra']
        whitelisted['Syria'] = ['Aleppo', 'Damascus']
        whitelisted['Saudi Arabia'] = ['Riyadh', 'Jeddah', 'Medina', 'Mecca', 'Dammam']
        whitelisted['Qatar'] = ['Doha']
        whitelisted['United Arab Emirates'] = ['Dubai', 'Abu Dhabi']
        whitelisted['Kuwait'] = ['Kuwait City']
        whitelisted['Oman'] = ['Muscat', 'Salalah']
        whitelisted['Yemen'] = ['Sanaa', 'Al Hudaydah']
        whitelisted['Sri Lanka'] = ['Colombo']
        whitelisted['Jordan'] = ['Amman']
        whitelisted['Israel'] = ['Jerusalem']
        whitelisted['Lebanon'] = ['Beirut']
        whitelisted['Armenia'] = ['Yerevan']
        whitelisted['Georgia'] = ['Tbilisi', 'Batumi']
        whitelisted['Azerbaijan'] = ['Baku']

        whitelisted['Egypt'] = ['Alexandria', 'Cairo', 'Suez', 'Bur Said']
        whitelisted['Libya'] = ['Tripoli', 'Banghazi']
        whitelisted['Tunisia'] = ['Tunis', 'Sfax']
        whitelisted['Algeria'] = ['Algiers', 'Oran']
        whitelisted['Morocco'] = ['Casablanca', 'Fez', 'Rabat', 'Agadir']
        whitelisted['Western Sahara'] = ['Bir Lehlou']
        whitelisted['Sudan'] = ['Khartoum', 'Port Sudan']
        whitelisted['South Sudan'] = ['Juba']
        whitelisted['Mauritania'] = ['Nouakchott']
        whitelisted['Senegal'] = ['Dakar']
        whitelisted['Mali'] = ['Ségou', 'Bamako']
        whitelisted['Cape Verde']= ['Praia']
        whitelisted['The Gambia'] = ['Banjul']
        whitelisted['Guinea Bissau'] = ['Bissau']
        whitelisted['Guinea'] = ['Conakry']
        whitelisted['Sierra Leone'] = ['Freetown']
        whitelisted['Liberia'] = ['Monrovia']
        whitelisted['Ivory Coast'] = ['Yamoussoukro']
        whitelisted['Ghana'] = ['Accra']
        whitelisted['Togo'] = ['Lomé']
        whitelisted['Burkina Faso'] = ['Ouagadougou']
        whitelisted['Benin'] = ['Porto-Novo']
        whitelisted['Niger'] = ['Niamey']
        whitelisted['Nigeria'] = ['Abuja', 'Kano', 'Lagos']
        whitelisted['Chad'] = [`N'Djamena`]
        whitelisted['Eritrea'] = ['Asmara']
        whitelisted['Djibouti'] = ['Djibouti']
        whitelisted['Somalia'] = ['Mogadishu']
        whitelisted['Ethiopia'] = ['Addis Ababa']
        whitelisted['Somaliland'] = ['Hargeisa']
        whitelisted['Central African Republic'] = ['Bangui']
        whitelisted['Cameroon'] = ['Douala', 'Yaoundé']
        whitelisted['Equatorial Guinea'] = ['Malabo']
        whitelisted['Gabon'] = ['Libreville']
        whitelisted['Congo (Brazzaville)'] = ['Brazzaville']
        whitelisted['Congo (Kinshasa)'] = ['Kinshasa', 'Kisangani', 'Lubumbashi']
        whitelisted['Kenya'] = ['Nairobi', 'Mombasa']
        whitelisted['Uganda'] = ['Kampala']
        whitelisted['Rwanda'] = ['Kigali']
        whitelisted['Burundi'] = ['Bujumbura']
        whitelisted['Tanzania'] = ['Dodoma', 'Dar es Salaam']
        whitelisted['Angola'] = ['Luanda', 'Moçâmedes']
        whitelisted['Zambia'] = ['Lusaka']
        whitelisted['Malawi'] = ['Lilongwe']
        whitelisted['Mozambique'] = ['Maputo', 'Beira']
        whitelisted['Zimbabwe'] = ['Harare']
        whitelisted['Namibia'] = ['Windhoek']
        whitelisted['Botswana'] = ['Gaborone']
        whitelisted['Madagascar'] = ['Antananarivo']
        whitelisted['eSwatini'] = ['Mbabane']
        whitelisted['Lesotho'] = ['Maseru']
        whitelisted['South Africa'] = ['Pretoria', 'Johannesburg', 'Cape Town', 'Port Elizabeth', 'Durban']
        whitelisted['Malaysia'] = ['Kuala Lumpur', 'Miri', 'Kuching']
        whitelisted['Brunei'] = ['Bandar Seri Begawan']
        whitelisted['Philippines'] = ['Manila', 'Zamboanga', 'Tacloban', 'Puerto Princesa']
        whitelisted['Indonesia'] = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Palembang', 
            'Samarinda', 'Makassar', 'Pontianak', 'Kupang', 'Sorong']
        whitelisted['Singapore'] = ['Singapore']
        whitelisted['East Timor'] = ['Dili']
        whitelisted['Papua New Guinea'] = ['Port Moresby', 'Lae']
        whitelisted['Solomon Islands'] = ['Honiara']
        whitelisted['Vanuatu'] = ['Port Vila']
        whitelisted['Fiji'] = ['Suva']
        whitelisted['Samoa'] = ['Apia']
        whitelisted['New Zealand'] = ['Wellington', 'Auckland', 'Christchurch', 'Dunedin']

        whitelisted['Argentina'] = ['Buenos Aires', 'Córdoba', 'Rosario']
        whitelisted['Chile'] = ['Santiago', 'Antofagasta', 'Temuco']
        whitelisted['Uruguay'] = ['Montevideo']
        whitelisted['Paraguay'] = ['Asunción']
        whitelisted['Peru'] = ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Iquitos']
        whitelisted['Ecuador'] = ['Guayaquil', 'Quito']
        whitelisted['Colombia'] = ['Bogota', 'Medellín', 'Cali', 'Barranquilla']
        whitelisted['Venezuela'] = ['Caracas', 'Maracaibo', 'Barquisimeto', 'Ciudad Guayana']
        whitelisted['The Guyana'] = ['Georgetown']
        whitelisted['Suriname'] = ['Paramaribo']
        whitelisted['Trinidad and Tobago'] = ['Port-of-Spain']
        whitelisted['Bolivia'] = ['Santa Cruz', 'La Paz', 'Cochabamba']
        whitelisted['Panama'] = ['Panama City']
        whitelisted['Costa Rica'] = ['San José']
        whitelisted['Nicaragua'] = ['Managua']
        whitelisted['Honduras'] = ['Tegucigalpa']
        whitelisted['El Salvador'] = ['San Salvador']
        whitelisted['Guatemala'] = ['Guatemala City']
        whitelisted['Dominican Republic'] = ['Santo Domingo']
        whitelisted['Jamaica'] = ['Kingston']
        whitelisted['Haiti'] = ['Port-au-Prince']
        whitelisted['Belize'] = ['Belmopan']
        whitelisted['Cuba'] = ['Havana', 'Santiago de Cuba']
        whitelisted['The Bahamas'] = ['Nassau']
        whitelisted['Mexico'] = ['Mexico City', 'Monterrey', 'Guadalajara', 'Chihuahua', 
            'Acapulco', 'Mérida', 'Tampico']
        
        special['Denmark'] = ['Nuuk']
        special['United Kingdom'] = ['Stanley']
        special['France'] = ['Cayenne', 'Nouméa', 'Saint Pierre, Réunion']
        special['Russia Northwest'] = ['St.  Petersburg', 'Kaliningrad', 'Archangel', 'Murmansk', 
            'Cherepovets', 'Vologda', 'Petrozavodsk', 'Syktyvkar', 'Velikiy Novgorod']
        special['Russia Central'] = ['Moscow', 'Smolensk', 'Voronezh', 'Yaroslavl', 'Ryazan',
            'Lipetsk', 'Tula', 'Bryansk']
        special['Russia Volgograd'] = ['Volgograd', 'Rostov', 'Sochi', 'Makhachkala', 'Sevastopol', 
            'Krasnodar', 'Astrakhan']
        special['Russia Volga'] = ['Kazan', 'Nizhny Novgorod', 'Saratov', 'Samara', 'Ufa', 
            'Perm', 'Izhevsk', 'Ulyanovsk', 'Orenburg']
        special['Russia Ural'] = ['Yekaterinburg', 'Chelyabinsk', 'Tyumen']
        special['Russia Novosibirsk'] = ['Novosibirsk', 'Omsk', 'Barnaul']
        special['Russia Krasnoyarsk'] = ['Krasnoyarsk', 'Norilsk']
        special['Russia Irkutsk'] = ['Irkutsk', 'Bratsk']
        special['Russia Sakha'] = ['Yakutsk']
        special['Russia Fareast South'] = ['Vladivostok', 'Khabarovsk', 'Yuzhno Sakhalinsk']
        special['Russia Fareast North'] = ['Petropavlovsk-Kamchatsky']

        special['China Northeast'] = ['Harbin', 'Changchun', 'Shenyeng']
        special['China North'] = ['Beijing', 'Tianjin', 'Baotou', 'Taiyuan']
        special['China East'] = ['Shanghai', 'Jinan', 'Fuzhou', 'Qingdao']
        special['China Southcentral'] = ['Nanchang', 'Wuhan', 'Zhengzhou', 'Hefei', 'Changsha']
        special['China South'] = ['Shantou', 'Guangzhou', 'Hong Kong', 'Nanning', 'Sanya']
        special['China Southwest'] = ['Chengdu', 'Kunming', 'Guiyang', 'Chongqing']
        special['China Northcentral'] = ['Lanzhou', `Xian`]
        special['China Northwest'] = ['Ürümqi']
        special['China Tibet'] = ['Lhasa']

        special['India South'] = ['Kochi', 'Kakinada', 'Chennai', 'Hyderabad']
        special['India Western'] = ['Mumbai', 'Ahmedabad', 'Nagpur']
        special['India Northeast'] = ['Guwahati']
        special['India Eastern'] = ['Kolkata', 'Ranchi', 'Raipur']
        special['India Northwest'] = ['Jaipur', 'Indore', 'Bhopal', 'Jabalpur']
        special['India North'] = ['Delhi', 'Kanpur', 'Patna', 'Ludhiana']
    
        special['Australia North'] = ['Darwin', 'Alice Springs']
        special['Australia West'] = ['Perth', 'Port Hedland']
        special['Australia Northeast'] = ['Cairns', 'Townsville', 'Mackay', 'Gladstone', 'Brisbane']
        special['Australia East'] = ['Sydney', 'Canberra', 'Newcastle']
        special['Australia Southeast'] = ['Melbourne', 'Hobart']
        special['Australia South'] = ['Adelaide']

        special['Canada North'] = ['Yellowknife']
        special['Canada Pacific'] = ['Vancouver']
        special['Canada Prairies'] = ['Edmonton', 'Calgary', 'Winnipeg', 'Saskatoon']
        special['Canada Ontario'] = ['Toronto', 'Ottawa', 'Thunder Bay']
        special['Canada Quebac'] = ['Montréal', 'Québec', 'Saguenay']
        special['Canada Atlantic'] = ['Halifax', `St. John's`, 'Moncton']
    
        
        special['Brazil Amazonia'] = ['Manaus', 'Rio Branco', 'Belém', 'Boa Vista']
        special['Brazil Northeast'] = ['Salvador', 'Recife', 'Fortaleza']
        special['Brazil Mato Grosso'] = ['Brasília', 'Campo Grande', 'Cuiabá', 'Goiânia']
        special['Brazil Southeast'] = ['Rio de Janeiro', 'São Paulo']
        special['Brazil South'] = ['Curitiba', 'Porto Alegre']

        special['USA Puerto Rico'] = ['San Juan']
        special['USA Alaska'] = ['Anchorage']
        special['USA Hawaii'] = ['Honolulu', 'Hilo']
        special['USA Pacific'] = ['Los Angeles', 'San Diego', 'Seattle', 'Portland', 'San Francisco']
        special['USA West'] = ['Salt Lake City', 'Las Vegas', 'Phoenix', 'Denver']
        special['USA Midwest'] = ['Kansas City', 'Minneapolis', 'St. Louis']
        special['USA Texas'] = ['Houston', 'Dallas', 'San Antonio', 'New Orleans']
        special['USA Great Lakes'] = ['Chicago', 'Detroit', 'Columbus', 'Indianapolis']
        special['USA South'] = ['Birmingham', 'Memphis', 'Nashville', 'Louisville']
        special['USA Atlantic'] = ['New York', 'Washington,  D.C.', 'Philadelphia', 'Charlotte', 
            'Jacksonville', 'Boston', 'Miami', 'Atlanta']
        
        let features = borderCountries.features
        for(let i = 0; i < features.length; i++)
        {
            let cName = features[i].properties.ADM0NAME
            if(whitelisted[features[i].properties.ADM0NAME] && 
                whitelisted[features[i].properties.ADM0NAME].includes(features[i].properties.NAME))
            {
                if(features[i].properties.ADM0NAME === "Serbia"){
                    cName = "Republic of Serbia"
                }
                if(features[i].properties.ADM0NAME === "Guinea Bissau"){
                    cName = "Guinea-Bissau"
                }
                
                if(features[i].properties.ADM0NAME === "Congo (Kinshasa)"){
                    cName = "Democratic Republic of the Congo"
                }
                if(features[i].properties.ADM0NAME === "Congo (Brazzaville)"){
                    cName = "Republic of the Congo"
                }
                if(features[i].properties.ADM0NAME === "Cape Verde"){
                    cName = "Cabo Verde"
                }
                if(features[i].properties.ADM0NAME === "The Gambia"){
                    cName = "Gambia"
                }
                if(features[i].properties.ADM0NAME === "Tanzania")
                {
                    cName = "United Republic of Tanzania"
                }
                let type = (features[i].properties.FEATURECLA === 'Admin-0 capital')
                if(features[i].properties.NAME === 'Niamey' && !type) continue
                if(features[i].properties.NAME === 'Johannesburg') type = false
                if(features[i].properties.NAME === 'Cape Town') type = false
                if(features[i].properties.NAME === 'Yangon') type = false
                if(features[i].properties.NAME === 'Bir Lehlou') type = true
                if(features[i].properties.NAME === 'Porto-Novo') type = true

                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type,
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: cName
                })
            }
            if(special['United Kingdom'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: false,
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'United Kingdom'
                })
            }
            if(special['France'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: false,
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'France'
                })
            }
            if(special['Denmark'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: false,
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Denmark'
                })
            }
            if(special['Canada North'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'Canada')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Yellowknife',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Canada North'
                })
            }
            if(special['Canada Pacific'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'Canada')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Vancouver',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Canada Pacific'
                })
            }
            if(special['Canada Prairies'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'Canada')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Edmonton',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Canada Prairies'
                })
            }
            if(special['Canada Ontario'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'Canada')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Ottawa',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Canada Ontario'
                })
            }
            if(special['Canada Quebac'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'Canada')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Montréal',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Canada Quebac'
                })
            }
            if(special['Canada Atlantic'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'Canada')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Halifax',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Canada Atlantic'
                })
            }
            if(special['USA Puerto Rico'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'Puerto Rico')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'San Juan',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA Puerto Rico'
                })
            }
            if(special['USA Alaska'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'United States of America')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Anchorage',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA Alaska'
                })
            }
            if(special['USA Hawaii'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'United States of America')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Honolulu',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA Hawaii'
                })
            }
            if(special['USA Pacific'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'United States of America')
            {
                if(features[i].properties.NAME === 'Portland' && 
                    features[i].properties.ADM1NAME !== "Oregon")
                {
                    continue
                }
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Los Angeles',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA Pacific'
                })
            }
            if(special['USA West'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'United States of America')
            {
                if(features[i].properties.NAME === 'Las Vegas' && 
                    features[i].properties.ADM1NAME !== "Nevada"){
                    continue
                }
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Salt Lake City',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA West'
                })
            }
            if(special['USA Midwest'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'United States of America')
            {
                if(features[i].properties.NAME === 'Kansas City' && 
                    features[i].properties.ADM1NAME !== "Kansas")
                {
                    continue
                }
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Kansas City',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA Midwest'
                })
            }
            if(special['USA Texas'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'United States of America')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Houston',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA Texas'
                })
            }
            if(special['USA South'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'United States of America')
            {
                if(features[i].properties.NAME === 'Nashville' && 
                    features[i].properties.ADM1NAME !== "Tennessee")
                {
                    continue
                }
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Birmingham',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA South'
                })
            }
            if(special['USA Great Lakes'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'United States of America')
            {
                if(features[i].properties.NAME === 'Columbus' && 
                features[i].properties.ADM1NAME !== "Ohio")
                {
                    continue
                }
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Chicago',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA Great Lakes'
                })
            }
            if(special['USA Atlantic'].includes(features[i].properties.NAME) &&
            features[i].properties.ADM0NAME === 'United States of America')
            {
                if(features[i].properties.NAME === 'Miami' && 
                features[i].properties.ADM1NAME !== "Florida")
                {
                    continue
                }
                if(features[i].properties.NAME === 'Jacksonville' && 
                features[i].properties.ADM1NAME !== "Florida")
                {
                    continue
                }
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Washington,  D.C.',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'USA Atlantic'
                })
            }
            if(special['Russia Central'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Moscow',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Central'
                })
            }
            if(special['Russia Northwest'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'St.  Petersburg',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Northwest'
                })
            }
            if(special['Russia Volgograd'].includes(features[i].properties.NAME))
            {
                if(features[i].properties.NAME_EN !== 'Rostov-on-Don' && features[i].properties.NAME === 'Rostov')
                {
                    continue
                }
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Volgograd',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Volgograd'
                })
            }
            if(special['Russia Volga'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Kazan',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Volga'
                })
            }
            if(special['Russia Ural'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Yekaterinburg',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Ural'
                })
            }
            if(special['Russia Novosibirsk'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Novosibirsk',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Novosibirsk'
                })
            }
            if(special['Russia Krasnoyarsk'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Krasnoyarsk',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Krasnoyarsk'
                })
            }
            if(special['Russia Irkutsk'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Irkutsk',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Irkutsk'
                })
            }
            if(special['Russia Sakha'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Yakutsk',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Sakha'
                })
            }
            if(special['Russia Fareast South'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Vladivostok',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Fareast South'
                })
            }
            if(special['Russia Fareast North'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Petropavlovsk-Kamchatsky',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Russia Fareast North'
                })
            }
            if(special['China Northeast'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Changchun',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'China Northeast'
                })
            }
            if(special['China North'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Beijing',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'China North'
                })
            }
            if(special['China East'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Shanghai',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'China East'
                })
            }
            if(special['China Southcentral'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Wuhan',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'China Southcentral'
                })
            }
            if(special['China South'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Guangzhou',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'China South'
                })
            }
            if(special['China Southwest'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Chengdu',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'China Southwest'
                })
            }
            if(special['China Northcentral'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Lanzhou',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'China Northcentral'
                })
            }
            if(special['China Northwest'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Ürümqi',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'China Northwest'
                })
            }
            if(special['China Tibet'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Lhasa',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'China Tibet'
                })
            }
            if(special['India South'].includes(features[i].properties.NAME))
            {
                if(features[i].properties.ADM0NAME === 'Pakistan')
                {
                    continue
                }
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Chennai',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'India South'
                })
            }
            if(special['India Western'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Mumbai',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'India Western'
                })
            }
            if(special['India Northeast'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Guwahati',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'India Northeast'
                })
            }
            if(special['India Eastern'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Kolkata',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'India Eastern'
                })
            }
            if(special['India Northwest'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Jaipur',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'India Northwest'
                })
            }
            if(special['India North'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Delhi',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'India North'
                })
            }
            if(special['Australia West'].includes(features[i].properties.NAME) && 
                features[i].properties.ADM0NAME === 'Australia')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Perth',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Australia West'
                })
            }
            if(special['Australia North'].includes(features[i].properties.NAME) && 
                features[i].properties.ADM0NAME === 'Australia')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Darwin',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Australia North'
                })
            }
            if(special['Australia Northeast'].includes(features[i].properties.NAME) && 
                features[i].properties.ADM0NAME === 'Australia')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Brisbane',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Australia Northeast'
                })
            }
            if(special['Australia South'].includes(features[i].properties.NAME) && 
                features[i].properties.ADM0NAME === 'Australia')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Adelaide',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Australia South'
                })
            }
            if(special['Australia Southeast'].includes(features[i].properties.NAME) && 
                features[i].properties.ADM0NAME === 'Australia')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Melbourne',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Australia Southeast'
                })
            }
            if(special['Australia East'].includes(features[i].properties.NAME)  && 
                features[i].properties.ADM0NAME === 'Australia')
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Canberra',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Australia East'
                })
            }
            if(special['Brazil Amazonia'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Manaus',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Brazil Amazonia'
                })
            }
            if(special['Brazil Mato Grosso'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Brasília',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Brazil Mato Grosso'
                })
            }
            if(special['Brazil Southeast'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Rio de Janeiro',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Brazil Southeast'
                })
            }
            if(special['Brazil Northeast'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Salvador',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Brazil Northeast'
                })
            }
            if(special['Brazil South'].includes(features[i].properties.NAME))
            {
                cities.push({
                    point: [features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]],
                    type: features[i].properties.NAME === 'Porto Alegre',
                    name: features[i].properties.NAME,
                    area: features[i].properties.ADM1NAME,
                    pop_max: features[i].properties.POP_MAX,
                    countryName: 'Brazil South'
                })
            }
        }
        res.send(cities)
        return
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new NaturalEarthGetCityRoute().getRouter();