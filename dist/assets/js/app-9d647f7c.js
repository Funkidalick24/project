class e{constructor(){this.TRIPADVISOR_API_KEY="3A0C6D6B302F48C5B8F4C6D467C03052",this.TRIPADVISOR_API_HOST="api.content.tripadvisor.com",this.AIRPORT_API_KEY="e50f7b332cmshdc890c9099bbd0ap1950a3jsn09341335f2ba",this.AIRPORT_API_HOST="airport-info.p.rapidapi.com"}async getCitySuggestions(e,t={}){if(!e&&!t.latLong)throw new Error("Either searchQuery or latLong is required");const a=`https://${this.TRIPADVISOR_API_HOST}/api/v1/location/search`,i=new URLSearchParams({key:this.TRIPADVISOR_API_KEY,language:t.language||"en"});if(e&&i.append("searchQuery",e),t.category){const e=["hotels","attractions","restaurants","geos"];if(!e.includes(t.category))throw new Error(`Invalid category. Must be one of: ${e.join(", ")}`);i.append("category",t.category)}if(t.phone){const e=t.phone.replace(/^\+/,"");i.append("phone",e)}if(t.address&&i.append("address",t.address),t.latLong){if(!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(t.latLong))throw new Error('Invalid latLong format. Must be "latitude,longitude"');i.append("latLong",t.latLong)}if(t.radius){if("number"!=typeof t.radius||t.radius<=0)throw new Error("Radius must be a positive number");i.append("radius",t.radius.toString())}if(t.radiusUnit){const e=["km","mi","m"];if(!e.includes(t.radiusUnit))throw new Error(`Invalid radiusUnit. Must be one of: ${e.join(", ")}`);i.append("radiusUnit",t.radiusUnit)}const r={method:"GET",headers:{accept:"application/json","X-API-KEY":this.TRIPADVISOR_API_KEY}};try{const e=await this.makeAPIRequest(`${a}?${i}`,r);return e.data?e.data.map((e=>{var t,a,i,r,o,s,n,l;return{id:e.location_id,name:e.name,type:e.location_type,address:{street:null==(t=e.address_obj)?void 0:t.street1,city:null==(a=e.address_obj)?void 0:a.city,state:null==(i=e.address_obj)?void 0:i.state,country:null==(r=e.address_obj)?void 0:r.country,postalCode:null==(o=e.address_obj)?void 0:o.postalcode,addressString:null==(s=e.address_obj)?void 0:s.address_string},coordinates:{latitude:e.latitude,longitude:e.longitude},category:{name:null==(n=e.category)?void 0:n.name,subcategories:(null==(l=e.subcategory)?void 0:l.map((e=>e.name)))||[]},rating:e.rating,numberOfReviews:e.num_reviews,rankingPosition:e.ranking_position,rankingCategory:e.ranking_category,phone:e.phone,website:e.website,email:e.email,priceLevel:e.price_level,distance:e.distance,bearing:e.bearing}})):[]}catch(o){throw new Error(`Failed to search locations: ${o.message}`)}}async searchNearby(e,t,a={}){var i,r;const o=`https://${this.TRIPADVISOR_API_HOST}/api/v1/location/nearby`,s=new URLSearchParams({key:this.TRIPADVISOR_API_KEY,latLong:`${e},${t}`,language:a.language||"en",radius:(null==(i=a.radius)?void 0:i.toString())||"5",radiusUnit:a.radiusUnit||"km",category:a.category||"hotels,restaurants,attractions",limit:(null==(r=a.limit)?void 0:r.toString())||"10"}),n={method:"GET",headers:{accept:"application/json","X-API-KEY":this.TRIPADVISOR_API_KEY}};try{const e=await this.makeAPIRequest(`${o}?${s}`,n);return e.data?e.data.map((e=>{var t,a,i,r,o,s,n;return{id:e.location_id,name:e.name,type:e.location_type,distance:e.distance,bearing:e.bearing,address:{street:null==(t=e.address_obj)?void 0:t.street1,city:null==(a=e.address_obj)?void 0:a.city,state:null==(i=e.address_obj)?void 0:i.state,country:null==(r=e.address_obj)?void 0:r.country,postalCode:null==(o=e.address_obj)?void 0:o.postalcode},coordinates:{latitude:e.latitude,longitude:e.longitude},rating:e.rating,numberOfReviews:e.num_reviews,category:{name:null==(s=e.category)?void 0:s.name,subcategories:(null==(n=e.subcategory)?void 0:n.map((e=>e.name)))||[]},priceLevel:e.price_level,phone:e.phone,website:e.website,openNow:e.open_now_text}})):[]}catch(l){throw new Error(`Failed to search nearby locations: ${l.message}`)}}async searchByCategory(e,t,a={}){return this.getCitySuggestions(e,{...a,category:t})}async searchHotels(e,t=""){var a;try{const i=null==(a=(await this.getCitySuggestions(e))[0])?void 0:a.id;if(!i)throw new Error(`Location not found for city: ${e}`);const r=`https://${this.TRIPADVISOR_API_HOST}/api/v1/location/${i}/hotels`,o={method:"GET",headers:{accept:"application/json","X-API-KEY":this.TRIPADVISOR_API_KEY}},s=await this.makeAPIRequest(r,o);return this.formatHotelResults(s,t)}catch(i){throw i}}async getLocationReviews(e,t={}){var a,i;if(!e)throw new Error("Location ID is required");const r=`https://${this.TRIPADVISOR_API_HOST}/api/v1/location/${e}/reviews`,o=new URLSearchParams({key:this.TRIPADVISOR_API_KEY,language:t.language||"en",limit:(null==(a=t.limit)?void 0:a.toString())||"10",offset:(null==(i=t.offset)?void 0:i.toString())||"0"}),s={method:"GET",headers:{accept:"application/json","X-API-KEY":this.TRIPADVISOR_API_KEY}};try{const e=await this.makeAPIRequest(`${r}?${o}`,s);return e.data?this.formatLocationReviews(e):[]}catch(n){throw new Error(`Failed to fetch location reviews: ${n.message}`)}}async getLocationReviewsPaginated(e,t=1,a=10,i="en"){return this.getLocationReviews(e,{language:i,limit:a,offset:(t-1)*a})}async getLocationPhotos(e,t={}){var a,i;if(!e)throw new Error("Location ID is required");const r=`https://${this.TRIPADVISOR_API_HOST}/api/v1/location/${e}/photos`,o=new URLSearchParams({key:this.TRIPADVISOR_API_KEY,language:t.language||"en",limit:(null==(a=t.limit)?void 0:a.toString())||"10",offset:(null==(i=t.offset)?void 0:i.toString())||"0"});if(t.source){const e=["Expert","Management","Traveler"],a=t.source.split(",").map((e=>e.trim())).filter((t=>!e.includes(t)));if(a.length>0)throw new Error(`Invalid photo sources: ${a.join(", ")}`);o.append("source",t.source)}const s={method:"GET",headers:{accept:"application/json","X-API-KEY":this.TRIPADVISOR_API_KEY}};try{const e=await this.makeAPIRequest(`${r}?${o}`,s);return e.data?e.data.map((e=>{var t,a,i,r,o,s,n,l;return{id:e.id,caption:e.caption,source:{type:(null==(t=e.source)?void 0:t.type)||"Unknown",name:null==(a=e.source)?void 0:a.name,url:null==(i=e.source)?void 0:i.url},images:{thumbnail:e.images.thumbnail.url,small:e.images.small.url,medium:e.images.medium.url,large:e.images.large.url,original:e.images.original.url},uploadDate:e.uploaded_date,user:{username:(null==(r=e.user)?void 0:r.username)||"Anonymous",userUrl:null==(o=e.user)?void 0:o.url,avatar:null==(l=null==(n=null==(s=e.user)?void 0:s.avatar)?void 0:n.small)?void 0:l.url},helpfulVotes:e.helpful_votes||0,categories:e.categories||[],tags:e.tags||[]}})):[]}catch(n){throw new Error(`Failed to fetch location photos: ${n.message}`)}}async getLocationPhotosBySource(e,t,a=10){return this.getLocationPhotos(e,{source:t,limit:a})}async getLocationPhotosPaginated(e,t=1,a=10){return this.getLocationPhotos(e,{limit:a,offset:(t-1)*a})}async getLocationDetails(e,t={}){if(!e)throw new Error("Location ID is required");const a=`https://${this.TRIPADVISOR_API_HOST}/api/v1/location/${e}/details`,i=new URLSearchParams({key:this.TRIPADVISOR_API_KEY,language:t.language||"en",currency:t.currency||"USD"}),r={method:"GET",headers:{accept:"application/json","X-API-KEY":this.TRIPADVISOR_API_KEY}};try{const e=await this.makeAPIRequest(`${a}?${i}`,r);if(!e)throw new Error("No location details found");return this.formatLocationDetails(e)}catch(o){throw new Error(`Failed to fetch location details: ${o.message}`)}}formatHotelResults(e,t=""){if(!e.data)return[];let a=e.data.map((e=>({id:e.location_id,name:e.name,rating:e.rating,price:{amount:e.price_level||"$$",currency:"USD"},address:e.address_obj?`${e.address_obj.street1}, ${e.address_obj.city}`:"",amenities:e.amenities||[],images:e.photo?[e.photo.images.large.url]:[],reviews:{count:e.num_reviews||0,score:e.rating||0}})));return t&&(a=a.filter((e=>e.rating>=parseInt(t)))),a}formatLocationReviews(e){return e&&e.data?e.data.map((e=>{var t,a,i,r,o,s,n,l,c,u,d,h;return{id:e.review_id,title:e.title,text:e.text,rating:e.rating,subRatings:e.subratings||{},publishedDate:e.published_date,tripType:e.trip_type,travelDate:e.travel_date,language:e.language,user:{username:(null==(t=e.user)?void 0:t.username)||"Anonymous",userLocation:(null==(a=e.user)?void 0:a.user_location)||"",contributions:(null==(i=e.user)?void 0:i.contributions)||0,memberLevel:(null==(r=e.user)?void 0:r.level)||null,memberSince:(null==(o=e.user)?void 0:o.created_time)||null},helpful:{votes:e.helpful_votes||0,thanked:e.thank_count||0},photos:(null==(s=e.photos)?void 0:s.map((e=>({id:e.id,url:e.images.large.url,thumbnailUrl:e.images.thumbnail.url,caption:e.caption,uploadDate:e.uploaded_date}))))||[],roomTip:e.room_tip||"",tripOrigin:e.trip_origin||"",visitDate:e.visit_date||"",managementResponse:e.management_response?{text:e.management_response.text,date:e.management_response.published_date,username:e.management_response.username,title:e.management_response.title||""}:null,ratings:{overall:e.rating,sleep:null==(n=e.subratings)?void 0:n.sleep_quality,location:null==(l=e.subratings)?void 0:l.location,rooms:null==(c=e.subratings)?void 0:c.rooms,service:null==(u=e.subratings)?void 0:u.service,value:null==(d=e.subratings)?void 0:d.value,cleanliness:null==(h=e.subratings)?void 0:h.cleanliness}}})):[]}formatLocationDetails(e){var t,a,i,r,o,s,n,l,c,u,d;if(!e)throw new Error("No location details found");return{id:e.location_id,name:e.name,description:e.description,webUrl:e.web_url,address:{street1:null==(t=e.address_obj)?void 0:t.street1,street2:null==(a=e.address_obj)?void 0:a.street2,city:null==(i=e.address_obj)?void 0:i.city,state:null==(r=e.address_obj)?void 0:r.state,country:null==(o=e.address_obj)?void 0:o.country,postalCode:null==(s=e.address_obj)?void 0:s.postalcode,addressString:null==(n=e.address_obj)?void 0:n.address_string},coordinates:{latitude:e.latitude,longitude:e.longitude},rating:e.rating,numberOfReviews:e.num_reviews,rankingData:{geoLocation:e.ranking_geo,ranking:e.ranking,category:e.ranking_category},photos:(null==(l=e.photos)?void 0:l.map((e=>{var t,a;return{id:e.id,caption:e.caption,url:e.images.large.url,thumbnailUrl:e.images.small.url,uploadDate:e.uploaded_date,source:{name:null==(t=e.source)?void 0:t.name,url:null==(a=e.source)?void 0:a.url}}})))||[],amenities:e.amenities||[],priceLevel:e.price_level,price:e.price,phone:e.phone,email:e.email,website:e.website,hours:{openNow:e.open_now_text,weekRanges:null==(c=e.hours)?void 0:c.week_ranges,timeZone:e.timezone},category:{name:null==(u=e.category)?void 0:u.name,subcategories:(null==(d=e.subcategory)?void 0:d.map((e=>e.name)))||[]}}}async makeAPIRequest(e,t,a=3){let i;for(let o=0;o<a;o++)try{const a=await fetch(e,t);if(!a.ok){const e=await a.text();throw new Error(`HTTP error! status: ${a.status}, message: ${e}`)}return await a.json()}catch(r){i=r,await new Promise((e=>setTimeout(e,1e3*Math.pow(2,o))))}throw i}formatDistance(e,t="km"){return"mi"===t?`${(.621371*e).toFixed(1)} miles`:`${e.toFixed(1)} km`}formatLocationForDisplay(e){var t,a;const i=[];if(i.push(e.name),e.type&&i.push(`(${e.type})`),e.distance&&i.push(this.formatDistance(e.distance)),null==(t=e.category)?void 0:t.name){const t=[e.category.name];(null==(a=e.category.subcategories)?void 0:a.length)>0&&t.push(e.category.subcategories.join(", ")),i.push(t.join(" - "))}const r=[];return e.address.street&&r.push(e.address.street),e.address.city&&r.push(e.address.city),e.address.state&&r.push(e.address.state),e.address.country&&r.push(e.address.country),r.length>0&&i.push(r.join(", ")),e.rating&&i.push(`${e.rating}★ (${e.numberOfReviews} reviews)`),e.openNow&&i.push(e.openNow),i.join(" | ")}async searchAirports(e){const t=`https://${this.AIRPORT_API_HOST}/airport`,a=new URLSearchParams({iata:e.toUpperCase()}),i={method:"GET",headers:{"x-rapidapi-key":this.AIRPORT_API_KEY,"x-rapidapi-host":this.AIRPORT_API_HOST}};try{const e=await fetch(`${t}?${a}`,i);if(!e.ok)throw new Error("Airport search failed");const r=await e.json();return this.formatAirportData(r)}catch(r){throw new Error("Failed to search airports")}}formatAirportData(e){return e?{id:e.iata,name:e.name,location:{city:e.city,state:e.state,country:e.country,latitude:e.latitude,longitude:e.longitude},code:e.iata,timezone:e.timezone,type:e.type,website:e.website,phone:e.phone}:null}async getLocationSearch(e={}){try{const t="/api/v1/location/search",a=new URLSearchParams({key:this.TRIPADVISOR_API_KEY,searchQuery:e.searchQuery||"",category:e.category||"attractions",language:e.language||"en",limit:e.limit||4});return(await this.makeRequest(`${t}?${a}`)).data||[]}catch(t){return[]}}async getLocationDetails(e){try{const t=`/api/v1/location/${e}/details`,a=new URLSearchParams({key:this.TRIPADVISOR_API_KEY});return(await this.makeRequest(`${t}?${a}`)).data||null}catch(t){return null}}async getLocationPhotos(e,t={}){try{const a=`/api/v1/location/${e}/photos`,i=new URLSearchParams({key:this.TRIPADVISOR_API_KEY,limit:t.limit||1});return(await this.makeRequest(`${a}?${i}`)).data||[]}catch(a){return[]}}async makeRequest(e,t={}){const a={method:"GET",headers:{Accept:"application/json","X-TripAdvisor-API-Key":this.TRIPADVISOR_API_KEY,"User-Agent":"TravelBuddy/1.0"}},i={...a,...t,headers:{...a.headers,...t.headers}};try{const t=await fetch(e,i);if(!t.ok){await t.text();if(401===t.status)throw new Error("API Authentication failed. Please check your API key.");throw new Error(`HTTP error! status: ${t.status}`)}return await t.json()}catch(r){throw r}}async getTopAttractions(e=4){try{return[{id:"1",name:"Eiffel Tower",location:{city:"Paris",country:"France"},rating:4.8,reviews:14e4,image:"assets/images/eiffel-tower.jpg",description:"Iconic iron lattice tower on the Champ de Mars"},{id:"2",name:"Colosseum",location:{city:"Rome",country:"Italy"},rating:4.7,reviews:13e4,image:"assets/images/colosseum.jpg",description:"Ancient amphitheater in the heart of Rome"},{id:"3",name:"Taj Mahal",location:{city:"Agra",country:"India"},rating:4.9,reviews:12e4,image:"assets/images/taj-mahal.jpg",description:"Stunning marble mausoleum and UNESCO World Heritage site"},{id:"4",name:"Machu Picchu",location:{city:"Cusco Region",country:"Peru"},rating:4.9,reviews:1e5,image:"assets/images/machu-picchu.jpg",description:"Ancient Incan city set high in the Andes Mountains"}]}catch(t){return[]}}}export{e as T};
//# sourceMappingURL=app-9d647f7c.js.map
