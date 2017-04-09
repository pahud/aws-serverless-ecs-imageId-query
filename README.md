# aws-serverless-ecs-imageId-query

### About

This is a server-less stack to query latest Amazon ECS AMI Image ID. You need to build the lambda bundle and deploy the whole stack to API Gateway and Lambda.



### Usage

#### Build the lambda bundle

```
$ make dist
```

this will save the bundle at **dist/function.zip**

#### Deploy

```
$ bin/deploy
```

this will leverage [SAM](https://aws.amazon.com/tw/about-aws/whats-new/2016/11/introducing-the-aws-serverless-application-model/) to deploy the serverless stack to AWS



#### Demo

```
$ curl -s https://ecs-image-info.livedemo.today/us-west-2
```

this will return the ECS Image info from *us-west-2*