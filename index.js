
'use strict';

var AWS = require('aws-sdk');
var Promise = require('bluebird')

var aws_region  = process.env['AWS_REGION'] ? process.env['AWS_REGION'] : 'ap-northeast-1'
var aws_profile = process.env['AWS_PROFILE'] ?  process.env['AWS_PROFILE'] : 'default'

AWS.config.update({ region: aws_region });

var ec2 = Promise.promisifyAll(new AWS.EC2());

var archToAMINamePattern = {
    "PV64": "amzn-ami-pv*x86_64-ebs",
    "HVM64": "amzn-ami-hvm*x86_64-gp2",
    "HVMG2": "amzn-ami-graphics-hvm*x86_64-ebs*",
    "ECS": "amzn-ami-*amazon-ecs-optimized"
}; 

var regionCache = []
var imageInfoCache = {}

var describeImagesParams = {
    Filters: [{ Name: "name", Values: [archToAMINamePattern["ECS"]]}],
    Owners: ["amazon"]
    //Owners: [event.ResourceProperties.Architecture == "HVMG2" ? "679593333241" : "amazon"]
};

function describeRegions() {
    return ec2.describeRegionsAsync()
}

function buildRegionCache() {
    return new Promise((resolve, reject)=> {
        if (regionCache.length == 0) {
        describeRegions()
        .then(data => { 
            regionCache = data.Regions.map( x=> x.RegionName)
            resolve()
        })
        .catch(e => { reject(e)} )
        } else {
            resolve()
        }
    })
}

function isBeta(imageName) {
    return imageName.toLowerCase().indexOf("beta") > -1 || imageName.toLowerCase().indexOf(".rc") > -1;
}

function getImageInfo(region) {
    return new Promise((resolve, reject) => {
        if (imageInfoCache[region]) {
            console.log(imageInfoCache[region])
            resolve(imageInfoCache[region])
        }
 
        AWS.config.update({ region: region });
        ec2 = Promise.promisifyAll(new AWS.EC2());            
        

        ec2.describeImagesAsync(describeImagesParams)
            //.then(data => console.log(data))
            .then( result => {
                var images = result.Images
                images.sort(function(x, y) { return y.Name.localeCompare(x.Name); });
                for (var j = 0; j < images.length; j++) {
                    if (isBeta(images[j].Name)) continue;
                    imageInfoCache[region] = images[j]
                    console.log(images[j])
                    resolve(images[j])     
                    //return images[j]
                    break;
                }
                resolve({})
            })


    })

}

exports.handler = (evt, ctx) => {
    //console.log(JSON.stringify(evt))
    buildRegionCache()
        .then(data => {
            if(evt.pathParameters.region && regionCache.indexOf(evt.pathParameters.region) > -1){
                console.log('valid region:', evt.pathParameters.region)
            } else {
                console.log('invalid region:', evt.pathParameters.region)
                return ctx.succeed({
                    statusCode: '403',
                    headers: { 'Content-Type': 'application/json' },
                    body: "invalid region"
                })                
                
            }
        })
        .then(data => getImageInfo(evt.pathParameters.region) )
        .then( data => {
            return ctx.succeed({
                statusCode: '200',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }) 
        })
}       
    
    // getImageInfo()
    //     .then( data => {
    //         return ctx.succeed({
    //             statusCode: '200',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify(data)
    //         }) 
    //     })

// getImageInfo()
//     .then(data => console.log(data))

// buildRegionCache()