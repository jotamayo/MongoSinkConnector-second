# MongoSinkConnector-second

## Description

In this exercise will learn to use kafka connectors

## What is it?

Kafka connect is a utility from confluent kafka, where you can integrate kafka with thirds parts

There are two types differents connectors: 

- Source: Where read of thirds parts and write any topic

- Sink: Where read a topic and write a thirds parts

See [List Connectors](https://www.confluent.io/product/connectors/?utm_medium=sem&utm_source=google&utm_campaign=ch.sem_br.nonbrand_tp.prs_tgt.kafka-connectors_mt.xct_rgn.emea_lng.eng_dv.all_con.kafka-connectors&utm_term=kafka+connectors+list&placement=&device=c&creative=&gclid=CjwKCAiAo4OQBhBBEiwA5KWu_5T468HK1OJu9zwwnW6f3RrRCmyHfYgn0-yPlEHw4Wb0g5DrFS8i6hoCJ18QAvD_BwE).

## Build

```
$ git clone https://github.com/jotamayo/MongoSinkConnector-second.git
$ cd MongoDB-Kafka-Connector-first-steps
$ docker-compose up -d
```

When finish all images to run, then you can go to

- You will can connect with database mongodb and check


```
docker exec -it mongodb bash
mongosh "mongodb://localhost:27017" --username admin --authenticationDatabase admin
test> use cop
cop>
cop> db.test.insertOne("msg", "message")
cop> db.getCollectionNames()
[ 'test' ]
cop> db.test.drop()
cop> db.getCollectionNames()
[ ]
cop > db.firstcollection.insertOne("hello world")
{
  acknowledged: true,
  insertedId: ObjectId("6208db954d9b42dc099b6043")
}
db.firstcollection.countDocuments()
1
cop > db.secondCollection.insertOne("hello world")
{
  acknowledged: true,
  insertedId: ObjectId("6208db954d9b42dc099b6043")
}
db.secondCollection.countDocuments()
1
cop > db.deleteCollection.insertOne("hello world")
{
  acknowledged: true,
  insertedId: ObjectId("6208db954d9b42dc099b6043")
}
db.deleteCollection.countDocuments()
1
```

We will create a new topic in kafka, we need download binary commands files before in [Download](https://www.apache.org/dyn/closer.cgi?path=/kafka/3.1.0/kafka_2.12-3.1.0.tgz)

```
./kafka-topics.sh --bootstrap-server localhost:9092 --create --topic second-topic --partitions 1 --replication-factor 3
Created topic second-topic.
```

## Connector Sink

It's time to create our first sink connector

```
curl --location --request POST 'http://localhost:8083/connectors' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "MongoDBSecondKeySink",
    "config": {
        "connector.class": "com.mongodb.kafka.connect.MongoSinkConnector",
        "topics":"second-topic",
        "tasks.max": "1",
        "output.format.value" : "schema",
        "output.json.formatter":"com.mongodb.kafka.connect.source.json.formatter.SimplifiedJson",
        "output.schema.infer.value":true,
        "connection.uri": "mongodb://admin:123@mongodb:27017/admin?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false",
        "database": "cop",
        "collection": "secondCollection",
        "document.id.strategy":"com.mongodb.kafka.connect.sink.processor.id.strategy.PartialValueStrategy",
        "document.id.strategy.overwrite.existing":"true",
        "value.projection.list":"type",
        "value.projection.type": "whitelist",
        "writemodel.strategy":"com.mongodb.kafka.connect.sink.writemodel.strategy.UpdateOneTimestampsStrategy",
        "errors.tolerance": "all",
        "errors.deadletterqueue.topic.name":"rfid_product_ean13_dataupload_dlq"
    }
}
'    
```

We can check  status new connector now

```
curl --location --request GET 'http://localhost:8083/connectors/MongoDBSecondKeySink/status'

{
    "name": "MongoDBFirstSink",
    "connector": {
        "state": "RUNNING",
        "worker_id": "kafka-connect:8083"
    },
    "tasks": [
        {
            "id": 0,
            "state": "RUNNING",
            "worker_id": "kafka-connect:8083"
        }
    ],
    "type": "sink"
}
```

If you want delete it, you need launch

```
curl --location --request DELETE 'http://localhost:8083/connectors/MongoDBSecondKeySink' \
--header 'Content-Type: application/json' \
--data-raw '   
```

Or list all connectors is this dns

```
curl --location --request GET 'http://localhost:8083/connectors'

[
    "MongoDBSecondKeySink",
]
``` 

We launch a producer

```
./kafka-console-producer.sh --broker-list localhost:9092 --topic second-topic --property parse.key=true --property key.separator=: < /insert-6000.data
```

So, we can see how there are new messages in a topic called first-topic



and there are new messages in a collection firstcollection

```
cop> db.secondCollection.countDocuments()
6008
```
