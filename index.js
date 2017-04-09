
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

var imageInfoCache = {}

var describeImagesParams = {
    Filters: [{ Name: "name", Values: [archToAMINamePattern["ECS"]]}],
    Owners: ["amazon"]
    //Owners: [event.ResourceProperties.Architecture == "HVMG2" ? "679593333241" : "amazon"]
};

function isBeta(imageName) {
    return imageName.toLowerCase().indexOf("beta") > -1 || imageName.toLowerCase().indexOf(".rc") > -1;
}

function getImageInfo() {
    return new Promise((resolve, reject) => {
        if (imageInfoCache[aws_region]) {
            console.log(imageInfoCache[aws_region])
            resolve(imageInfoCache[aws_region])
        }

        ec2.describeImagesAsync(describeImagesParams)
            //.then(data => console.log(data))
            .then( result => {
                var images = result.Images
                images.sort(function(x, y) { return y.Name.localeCompare(x.Name); });
                for (var j = 0; j < images.length; j++) {
                    if (isBeta(images[j].Name)) continue;
                    imageInfoCache[aws_region] = images[j]
                    console.log(images[j])
                    resolve(images[j])     
                    //return images[j]
                    break;
                }
            })


    })

}

exports.handler = (evt, ctx) => {
    console.log(JSON.stringify(evt))
    getImageInfo()
        .then( data => {
            return ctx.succeed({
                statusCode: '200',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }) 
        })
}

// getImageInfo()
//     .then(data => console.log(data))


  