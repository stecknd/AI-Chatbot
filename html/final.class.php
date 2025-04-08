<?php 
class final_rest
{



/**
 * @api  /api/v1/setTemp/
 * @apiName setTemp
 * @apiDescription Add remote temperature measurement
 *
 * @apiParam {string} location
 * @apiParam {String} sensor
 * @apiParam {double} value
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
	public static function setTemp ($location, $sensor, $value)

	{
		if (!is_numeric($value)) {
			$retData["status"]=1;
			$retData["message"]="'$value' is not numeric";
		}
		else {
			try {
				EXEC_SQL("insert into temperature (location, sensor, value, date) values (?,?,?,CURRENT_TIMESTAMP)",$location, $sensor, $value);
				$retData["status"]=0;
				$retData["message"]="insert of '$value' for location: '$location' and sensor '$sensor' accepted";
			}
			catch  (Exception $e) {
				$retData["status"]=1;
				$retData["message"]=$e->getMessage();
			}
		}

		return json_encode ($retData);
	}


/**
 * @api  /api/v1/getLevel/
 * http://172.17.13.168/final.php/getLevel
 * @apiName getLevel
 * @apiDescription Return all level data from database
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *              "result": [
 *                { 
 *                  levelID: 1,
 *                  description: "",
 *                  prompt: ""
 *              ]
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
  public static function getLevel () {
	try {
		$retData["result"]=GET_SQL("SELECT * FROM level ORDER BY sortCode");
		$retData["status"]=0;
		$retData["message"]="Success";
	}
	catch  (Exception $e) {
		$retData["status"]=1;
		$retData["message"]=$e->getMessage();
	}
	return json_encode ($retData);
  }

/**
 * @api  /api/v1/addLog/
 * http://172.17.13.168/final.php/addLog?inputdata=1&outputdata=2
 * @apiName addLog
 * @apiDescription Add record to logfile
 *
 * @apiParam {Integer} inputdata
 * @apiParam {Integer} outputdata
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
  public static function addLog ($inputdata, $outputdata) {
	try {
		# Escape the #'s since they make a comment
		$outputdata = str_replace('#', '\\#', $outputdata);

		#$date = new DateTime('now', new DateTimeZone('America/New_York'));  // EST timezone
		#$estDate = $date->format('Y-m-d H:i:s');  // Format it for SQL
		
		EXEC_SQL("INSERT INTO log (requestTime, inputData, outputData) VALUES (CURRENT_TIMESTAMP, ?, ?)", $inputdata, $outputdata);
		$retData["status"]=0;
		$retData["message"]="Success";
	}
	catch (Exception $e) {
		$retData["status"]=1;
		$retData["message"]=$e->getMessage();
	}
	return json_encode ($retData);
  }
  

/**
 * @api  /api/v1/getLog/
 * http://172.17.13.168/final.php/getLog?date=2024-11-15&numrecords=3
 * @apiName getLog
 * @apiDescription Retrieve Log Records
 *
 * @apiParam {string} date
 * @apiParam {String} numrecords
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 * @apiSuccess {string} result
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *              "result": [
 *                { 
 *                  timeStamp: "YYYY-MM-DD HH:MM:SS",
 *                  level: "",
 *                  systemPrompt: "",
 *                  userPrompt: "",
 *                  chatResponse: "",
 *                  inputTokens: 0,
 *                  outputTokens: 0
 *              ]
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
  public static function getLog ($startdate, $enddate, $numrecords) {
	try {
		$retData["status"]=0;
		$retData["message"]="Success";
		$retData["result"]=GET_SQL("SELECT * FROM log WHERE DATE(requestTime)>=? AND DATE(requestTime)<=? ORDER BY requestTime DESC LIMIT ?", $startdate, $enddate, $numrecords);
	}
	catch (Exception $e) {
		$retData["status"]=1;
		$retData["message"]=$e->getMessage();
	}
	return json_encode ($retData);
  }
}

