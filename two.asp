<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=8" />
      <link rel="stylesheet" type="text/css" href="css/jquery.fileExplorer.css" />
      <link rel="stylesheet" type="text/css" href="css/jquery-ui-1.8.10.custom.css" />
      <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
      <script>window.jQuery || document.write('<script src="scripts/jquery-1.7.2.min.js"><\/script>')</script>
      <script type="text/javascript" src="scripts/jquery.fileExplorer.js"></script>
      <script type="text/javascript" src="scripts/jquery-ui-1.8.10.custom.min.js"></script>
      <script type="text/javascript">
         $(document).ready(function() {
            $('#container').fileExplorer({ 
               script: 'includes/jquery.FileExplorer.asp',
            });
            $('#container2').fileExplorer({ 
               script: 'includes/jquery.FileExplorer.asp',
            });
         });
      </script>
      <title>Filesystem Test</title>
   </head>
   <body>
      <h1>File Explorer</h1>
      <div id="container" style="width:45%;float:left">
      </div>
      <div id="container2" style="width:45%;float:right;">
      </div>
   </body>
</html>