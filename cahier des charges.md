# Cahier des charges Tancrède Simonin X Tastyn

28/01/2022


## Description


Dans cette version, le produit permet d'ouvrir la porte du frigo connecté, d'enregistrer qui a acheté quoi et quand, avec une trace détaillée, mais sans connexion avec le système de paiement, et sans accès en direct à l'achat de produits, mais accès à la liste définitive des produits achetés une fois la porte fermée.

Vous aurez donc accès à toute cette data avec un espace admin de gestion de la base de donnée, et toute cette data sera accessible via bubble avec des get simples pour récupérer la liste des transactions par user, chaque transaction en détail et la liste des produits de chaque transaction.


## Estimation

- création bases de données, API REST pour accéder à ces données, setup de développement (git) et déploiement sur serveurs: 1 journée
- création du client websocket et code de la logique de souscription aux événements : 3 jours
- création des workflows bubble pour taper sur cette API et tests de ce setup: 1 jour, sur place


## Détails de l'implémentation :

Création d'un serveur intermédiaire

- accessible en REST ( GET, POST … )

- avec un client websocket intégré (pour communiquer en WS avec l’API Vendron Cloud) qui enregistre dans `transaction` des `events` de ce qui se passe
- souscription à l'événement `smart_fridge_request_error` avec potentiellement des alertes slack ou autre en direct en phase de test

- avec une base de donnée:

  - objet: `transaction` permet d'enregistrer 1 flow de transaction ou tentative
  - objet: `machine`
  - objet: `user` permet de lier les `transaction` à un user
  - objet: `event` permet d'enregistrer l'historique d'activité liée à une transaction


La conception de la base de donnée et de l'API REST sera faite avec strapi.io, cela permettra entre autres d'avoir un accès admin à toute la data dans le même style que les db de bubble pour que vous ayez une visibilité sur ce qui se passe, sans avoir à dev un backoffice.

## User flow

1. l'utilisateur demande le statut de la machine (avec la route `machine/{id}/status`)
2. Si OK l'utilisateur demande l'ouverture du frigo ( avec le POST, et si réponse rapide cela lui dit de suite, sinon bouton "vérifier l'ouverture de la porte" qui fait un get sur `transaction/{id}` qui contient le statut du frigo.
3. l'utilisateur ferme la porte, à ce moment la liste des produits acheté est envoyé en WS et enregistrée, disponible avec GET `transaction/{id}`

## Routes nécessaires:

**GET** `{machine_id}/status`

- envoie en WS à Vendron le `check_machine_state`
- récupère statut
- ? note *potentiellement intéressant d'enregistrer cet event, car s'il n'est pas suivi d'une transaction c'est probablement qu'il y a eu un pb*
- **Réponse**: renvoie le statut récupéré


**POST** `{machine_id}/open`

Données à envoyer:
- informations user (id bubble et email au moins)
- informations de transaction de stripe


- recherche ou crée un `user` (très simple, juste pour avoir une trace)
- crée un objet `transaction` en base de donnée avec les infos de transaction reçues par stripe, une relation au `user` et un id unique `ref`
- envoie en WS à Vendron le `smart_fridge_door_open` avec la `ref` et toutes les infos de la transaction ( l'objet `transaction`)
- récupère la réponse
- **Réponse** : renvoie la ref et l'id de transaction si succès : (permet sur le front de faire le get sur `/transaction/{id}` dans la foulée)

à partir de là dans le backend
- le serveur reste allumé pour enregistrer en base de donnée les événements liés à cette transaction (en tant que `events` ( liés à l'objet `transaction`) ) tel que `smart_fridge_door_open_success`,  `smart_fridge_door_close_success` et `smart_fridge_request_completed`.


**GET** `transaction/{transaction_id}`

- va chercher dans la base de donnée dans l'objet `transaction` les données présentes
  - permet de connaître le statut du frigo juste après la demande d'ouverture si ça a mis du temps à répondre
  - permet d'obtenir la liste des produits achetés une fois le frigo refermé
  - permet d'obtenir la confirmation que le frigo est bien fermé


Fourni dans cette config:

**GET** `transaction/search`

- permet de rechercher les transaction par date, user, etc...