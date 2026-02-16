$nro_inicial = {cmp_desde};  // Número inicial
$nro_final = {cmp_hasta};    // Número final
$total = $nro_final - $nro_inicial +1 ;
$mes = {cmp_mes};      // Campo del mes
$year = {cmp_year};  // Campo del año





$progreso = 0;

// Consulta para obtener los registros dentro del rango
$check_sql = "
    SELECT prefijo, codigo AS factura 
    FROM facturas a 
    WHERE a.mes = $mes 
      AND a.year = $year
      AND a.instalacion_codigo BETWEEN $nro_inicial AND $nro_final";


// Ejecutar la consulta
sc_select(dataset, $check_sql);

if (false === {dataset}) {
    // Manejar el error en caso de fallo en la consulta
    sc_error_message("Error al ejecutar la consulta SQL.");
} elseif ({dataset}->EOF) {
    // Si no hay registros
    sc_alert("No se encontraron registros para los criterios seleccionados.");
} else {
    // Procesar los resultados
	$size = $dataset->RecordCount();
	$progreso++;
	sc_ajax_javascript('actualizarBarra', array($progreso, $size));
    while (!{dataset}->EOF) {
		$progreso++;
		sc_ajax_javascript('actualizarBarra', array($progreso, $size));
		
        $prefijo = {dataset}->fields[0]; // Primer campo (prefijo)
        $factura = {dataset}->fields[1]; // Segundo campo (factura)

		$check_sql = "SELECT factura,type_document_id,type_operation_id,current_date as fecha,hora,resolucion,last_valid_payment_date,"
		  . "stratum_id,type_spd_id,office_lending_company,contract_number,issue_date,party_name,street_name,additional_street_name,"
		  . "municipality_id,stratum,email,duration_of_the_billing_cycle,total_metered_unit_id,total_metered_quantity,"
		  .	"consumption_payable_amount,consumption_price_quantity,partial_line_extension_amount,"
		  . "instalacion_codigo,utiliy_meter,consumption_history,customer,legal_monetary_totals,invoice_lines,allowance_charges"
		  .	" FROM public.view_facturas_dian where prefijo ='".$prefijo."' and   factura=".$factura;
		sc_lookup_field(rs, $check_sql);
		//echo 'check_sql: '. $check_sql;

		//echo 'Respuesta: '.var_dump({rs[0]});
		//echo 'Respuesta: '.{rs[0][6]};
		$utilitymeter = {rs[0]['utiliy_meter']};
		$consumption_history = {rs[0]['consumption_history']};
		$customer =  {rs[0]['customer']};
		$allowance_charges =  {rs[0]['allowance_charges']};
		$legal_monetary_totals = {rs[0]['legal_monetary_totals']};
		$invoice_lines = {rs[0]['invoice_lines']};
		//$email =  {rs[0]['email']};
		//json_encode($data, JSON_PRETTY_PRINT)
		//echo 'Respuesta: '.$utilitymeter;
		$date = date("Y-m-d"); // Pendiente 
		$time = date("H:i:s"); // Pendiente

		$tax_totals = array(
				array(
					"tax_id" => 1, // Pendiente
					"tax_amount" =>  0.00,
					"taxable_amount" => {rs[0]['partial_line_extension_amount']},
					"percent" => 0.00 
				)
			);
		if (isset({rs[0]['factura']}))     // Row found
		{	

			$data =  [
				"number" => $factura,
				"type_document_id" => 24,
				"type_operation_id" => 28,
				"date" => $date,
				"time" =>  $time,
				"resolution_number" => 'SSP', //{rs[0]['resolucion']},
				"prefix" => $prefijo,  
				"notes" => ".",
				"sendmail" => true,
				"sendmailtome" => true,
				"foot_note"  => ".",
				"last_valid_payment_date" => {rs[0]['last_valid_payment_date']},
				"payment_reference" => "SOCORRO-".{rs[0]['contract_number']},
				"stratum_id" => {rs[0]['stratum_id']},
				"software_manufacturer" => [
					"name" => "WEIMAR SANCHEZ GAVIRIA",
					"business_name" => "UNIT SOLUTIONS",
					"software_name" => "WPOSACDTO"
				],
				"spd" => [ 
						[
							"agency_information" => [
								"type_spd_id" => {rs[0]['type_spd_id']},
								"office_lending_company" => {rs[0]['office_lending_company']},
								"contract_number" => {rs[0]['contract_number']},
								"issue_date" => {rs[0]['issue_date']},
								"note" => ".",
							],	
							"subscriber_party" => [
								"party_name" => {rs[0]['party_name']},
								"street_name" => {rs[0]['street_name']},
								"additional_street_name" => {rs[0]['additional_street_name']},
								"municipality_id" => {rs[0]['municipality_id']},
								"stratum" => {rs[0]['stratum']},
								"email" => {rs[0]['email']},
							],
							"subscriber_consumption" => [
								"duration_of_the_billing_cycle" => {rs[0]['duration_of_the_billing_cycle']},
								"consumption_section_note" => "consumo",
								"total_metered_unit_id" => {rs[0]['total_metered_unit_id']},
								"total_metered_quantity" => {rs[0]['total_metered_quantity']},
								"consumption_payable_amount" => {rs[0]['consumption_payable_amount']},
								"consumption_price_quantity" => {rs[0]['consumption_price_quantity']},
								"partial_line_extension_amount" => {rs[0]['partial_line_extension_amount']},
								"utiliy_meter" => json_decode($utilitymeter),
								"consumption_history" =>  json_decode($consumption_history), 

							],
						]
					],
				"customer" => json_decode($customer),
				"legal_monetary_totals" => json_decode($legal_monetary_totals),
				"tax_totals" => $tax_totals,
				"invoice_lines" => json_decode($invoice_lines),

			];
			//$clean_data = stripslashes(json_decode($data));
			$json_data = json_encode($data, JSON_PRETTY_PRINT);
            // DEBUG: Loguear el JSON generado para revisar el correo
            error_log("JSON a enviar a DIAN (Factura $prefijo-$factura): " . $json_data);
            
			//print_r($json_data);
			$servidor='http://108.181.193.178:81/apidian2/public/api/ubl2.1/eqdoc';
			$tocken ='830b6616b1b2c93bc67efdc972389c0503e46077fe0751333934fd2acd4afc57';
			$curl = curl_init();
			//echo 'dddata::::::'. $json_data;
			//poner la ip
			curl_setopt_array($curl, array(
			  CURLOPT_URL => $servidor,
			  CURLOPT_RETURNTRANSFER => true,
			  CURLOPT_ENCODING => '',
			  CURLOPT_MAXREDIRS => 10,
			  CURLOPT_TIMEOUT => 0,
			  CURLOPT_FOLLOWLOCATION => true,
			  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			  CURLOPT_CUSTOMREQUEST => 'POST',
			  CURLOPT_POSTFIELDS => $json_data,
			  CURLOPT_HTTPHEADER => array(
				'Content-Type: application/json',
				'Accept: application/json',
				'Authorization: Bearer '.$tocken
			  ),
			));

			$response = curl_exec($curl);


			curl_close($curl);
			$data = json_decode($response, true);

			// Acceder al valor de "IsValid"
			//$isValid = $data['ResponseDian']['Envelope']['Body']['SendBillSyncResponse']['SendBillSyncResult']['IsValid'];
			//if($isValid == 'false'){
				// SQL statement parameters
				$update_sql  = "UPDATE facturas set rep_dian = '".$response."' where prefijo='". $prefijo."' and codigo=". $factura; 
				sc_exec_sql($update_sql);
			//}
			

		}
		// Obligamos al servidor a enviar la salida al navegador
		//flush();
		//ob_flush();
		

        // Mover al siguiente registro
        {dataset}->MoveNext();
    }
    {dataset}->Close(); // Cerrar el cursor al finalizar
	sc_alert('Proceso completado.');

}




