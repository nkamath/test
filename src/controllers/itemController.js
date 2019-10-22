const itemQueries = require("../db/queries.items.js");
const socket = require("../socket");

module.exports = {
    index(req, res, next){
        itemQueries.getItemsByUser(req.user,(err,items)=>{
            if(err){
                res.redirect(500, "/");
            } else{
                items.sort(function (a, b) {
                    if(a.isPurchased && b.isPurchased){
                        return 0; 
                    } else if(a.isPurchased){
                        return 1;
                    } else if (b.isPurchased){
                        return -1; 
                    } else{
                        return 0;
                    }
                  });
                res.render("items/index", {items});
            }
        });
    },
    new(req, res, next){
        res.render("items/new");
    },
    create(req, res, next){
        let newItem = {
          name: req.body.name,
          userId: req.user.id
        };
        itemQueries.addItem(newItem, (err, item) => {
          if(err){
            res.redirect(500, "/items/new");
          } else {
            res.redirect(303, `/items`);
            socket.emit('item_changed');
          }
        });
      }, 
    edit(req, res, next){
        itemQueries.getItem(req.params.id, (err, item) => {
            if(err || item == null){
            res.redirect(404, "/items");
            } else {
            res.render(`items/edit`, {item});
            }
        });
    },
    update(req, res, next){
            itemQueries.updateItem(req.params.id, req.body, (err, item) => {
            if(err || item == null){
                console.log(err);
                res.redirect(404, `/items`);
            } else {
                socket.emit('item_changed');
                res.redirect(`/items`);
            }
            });
        },             
    destroy(req, res, next){
        console.log(req.params.id + " is being deleted");
        itemQueries.deleteItem(req.params.id, (err, item) => {
            if(err){
            res.redirect(500, `/items`)
            } else {
                socket.emit('item_changed');
                res.redirect(303, "/items")
            }
        });
    }
       
}