require('isomorphic-fetch');
const Koa = require('koa');
const express = require('express');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const dotenv = require('dotenv');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');


dotenv.config();
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const Router = require('koa-router');
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const getSubscriptionUrl = require('./server/getSubscriptionUrl');
const getThemeComponents = require('./server/getThemeComponents');


const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_themes', 'write_themes', 'read_products', 'write_products', 'read_script_tags', 'write_script_tags', 'read_checkouts', 'write_checkouts', 'read_orders', 'write_orders'],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set("shopOrigin", shop, { httpOnly: false });

        const registration = await registerWebhook({
          address: `${HOST}/webhooks/orders/create`,
          topic: 'ORDERS_CREATE',
          accessToken,
          shop,
        });

        if (registration.success) {
          console.log('Successfully registered webhook!');
        } else {
          console.log('Failed to register webhook', registration.result);
        }


        await getSubscriptionUrl(ctx, accessToken, shop);
        await getThemeComponents(ctx, accessToken, shop);
      },
    }),
  );


  const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET_KEY });


  router.post('/webhooks/orders/create', webhook, async (ctx) => {

    console.log("!!!");

    console.log(ctx.request.body);
    var orderData = ctx.request.body;
    var cartToken = orderData.cart_token;
    var date = orderData.created_at;
    var totalPrice = orderData.total_price;
    var orderID = orderData.id;
    console.log(cartToken);
    console.log("?????");

    console.log('received webhook: ', ctx.state.webhook);
    console.log(Date.now());


    const https = require('https')

    const data = JSON.stringify({
      order: {
        id: orderID,
        tags: "hold",
        note: "Pending veification",
        created_at: date,
        total_price: totalPrice,
        order_data: orderData
      },

      session_id: cartToken,
      website_version: "Shopify"
    })

    const options = {
      hostname: 'cloud.validage.com',
      path: '/person/easycheck_shopify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`)

      res.on('data', (d) => {

        resObj = JSON.parse(d);
        code=resObj.code;
        cyaCode=resObj.cya_code;
        message=resObj.message;
        cyaStatus=resObj.cya_status;
        cyaMessage=resObj.cya_message;

       // state = d.order_status; //tag
       // status = d.order_message; //note

        process.stdout.write(d)
      })
    })

    req.on('error', (error) => {
      // console.error(error)
    })

    req.write(data)
    req.end()

  });

  server.use(graphQLProxy({ version: ApiVersion.April19 }));
  router.get('*', verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);

  });
});