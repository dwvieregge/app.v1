<?php

use Slim\App;
use Slim\Http\Request;
use Slim\Http\Response;

/**
 * mine
 */
use Classes\User;
use Classes\Session;
use Classes\Customer;
use Classes\StarRating;
use Classes\Forgot;

return function (App $app) {

    $container = $app->getContainer();

    ##$app->get('/[{name}]', function (Request $request, Response $response, array $args) use ($container) {
    ##    // Sample log message
    ##    $container->get('logger')->info("Slim-Skeleton '/' route");

        // Render index view
    ##    return $container->get('renderer')->render($response, 'index.phtml', $args);
    ##});

    /**
     * route:
     * homepage
     */
    $app->get('/', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' route");

        // Render index view
        return $container->get('renderer')->render($response, 'index.phtml', $args);
    });

    /**
     * route:
     * login with user and password
     */
    $app->get('/login/{email}/{pswd}', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' login");

        $data = new stdClass();

        /**
         * auth user and copy data
         */
        $user = new User($args);
        $user->Auth();
        $data->user = $user;

        /**
         * success create session and find what customer
         */
        if ( $user->success ) {
            if ( $user->isvalid && $user->active ) {
                $session = new Session($user);
                $data->session = $session;

                $customer = new Customer($user);
                $customer->View();
                $data->customer = $customer;
            }
        } else {
            $data->error =  'User not found';
        }
        echo json_encode($data);
    });

    /**
     * route:
     * get new star rating (homepage)
     */
    $app->get('/starrating', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' starrating");

         $data = new stdClass();
         $data->success =  1;

        $starrating = new StarRating();
        $starrating->View();
    });

    /**
     * route:
     * create new star rating
     */
    $app->post('/starrating', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' starrating");

        $data = new stdClass();
        $data->success =  1;

        // Render index view
        $starrating = new StarRating();
        $starrating->Add();
    });

    /**
     * route:
     * forgot email
     */
    $app->get('/forgot/{email}', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' forgot");

        $data = new stdClass();

        /**
         * see if they are a authorized user
         */
        $user = new User($args);
        $user->Auth();

        /**
         * should only be one matching user
         */
        if ( $user->success && $user->active ) {
            $forgot = new Forgot($user);
            $forgot->SendLinkEmail();
            $data = $forgot;
        } else if ( !$user->active) {
            $data->error =  1;
        } else {
            $data->error = 2;
        }
        echo json_encode($data);
    });

    /**
     * route:
     * reset user password
     */
    $app->get('/12d945k0sdk/{keyhash}', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' forgot");

        $data = new stdClass();

        /**
         * see if they are a authorized user
         */
        $forgot = new Forgot();

        if ( $forgot->HashIsGood($args['keyhash']) ) {
            $data->success =  1;
        }
        else {
            $data->error =  "Your link didn't work. Go again.";
        }
        echo json_encode($data);
    });
};
