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

return function (App $app) {

    $container = $app->getContainer();

    ##$app->get('/[{name}]', function (Request $request, Response $response, array $args) use ($container) {
    ##    // Sample log message
    ##    $container->get('logger')->info("Slim-Skeleton '/' route");

        // Render index view
    ##    return $container->get('renderer')->render($response, 'index.phtml', $args);
    ##});

    /**
     * homepage
     */
    $app->get('/', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' route");

        // Render index view
        return $container->get('renderer')->render($response, 'index.phtml', $args);
    });

    /**
     * login
     */
    $app->get('/login/{email}/{pswd}', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' login");

        $data = new stdClass();

        $user = new User($args);
        $data->user = $user;

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

    $app->get('/starrating', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' starrating");

         $data = new stdClass();
         $data->success =  1;

        // Render index view
        $starrating = new StarRating();
        $starrating->View();

    });

    $app->post('/starrating', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' starrating");

        $data = new stdClass();
        $data->success =  1;

        // Render index view
        $starrating = new StarRating();
        $starrating->Add();

    });

    $app->get('/forgot', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' starrating");

        $data = new stdClass();

        /**
         * see if they are a user
         */
        $user = new User($args);
        $data->user = $user;

        /**
         * they are, search
         */
        if ( $user->success ) {
            if ( $user->isvalid && $user->active ) {
                $forgot = new Forgot($user);
                $forgot->GetLink();
                var_dump($forgot);
            }
        } else {
            $data->error =  'User not found';
        }
        echo json_encode($data);

    });
};
