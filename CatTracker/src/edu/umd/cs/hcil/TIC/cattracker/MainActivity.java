package edu.umd.cs.hcil.TIC.cattracker;

import android.provider.Settings.Secure;

import com.loopj.android.http.*;

import edu.umd.cs.hcil.TIC.cattracker.R;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.Toast;

public class MainActivity extends Activity {
	/* GEAR PARAMETERS */
	private final String BLACK_GEAR_ID = "GALAXY Gear (7BDB)";
	private boolean blackGearFound = false;
	
	private final String WHITE_GEAR_ID = "GALAXY Gear (9F2B)";
	private boolean whiteGearFound = false;
	
	private BluetoothAdapter BTAdapter;
	private AsyncHttpClient httpClient;
	private String android_id;

	private final BroadcastReceiver receiver = new BroadcastReceiver(){
		@Override
		public void onReceive(Context context, Intent intent) {
			String action = intent.getAction();
			if(BluetoothDevice.ACTION_FOUND.equals(action)) {
				short rssi = intent.getShortExtra(BluetoothDevice.EXTRA_RSSI,Short.MIN_VALUE);
				String name = intent.getStringExtra(BluetoothDevice.EXTRA_NAME);
				
				Toast.makeText(getApplicationContext(), "Found " + name + " at " + rssi + "dBm.", Toast.LENGTH_SHORT).show();
				
				if (name.equals(BLACK_GEAR_ID)) blackGearFound = true;
				else if (name.equals(WHITE_GEAR_ID)) whiteGearFound = true;
				else return;

				sendData(name, rssi);
			}
			else if (BluetoothAdapter.ACTION_DISCOVERY_STARTED.equals(action)) {
				Toast.makeText(getApplicationContext(), "Starting bluetooth scan...", Toast.LENGTH_SHORT).show();	
			}
			else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
				if (!blackGearFound) sendData(BLACK_GEAR_ID, 0);
				if (!whiteGearFound) sendData(WHITE_GEAR_ID, 0);
				Toast.makeText(getApplicationContext(), "Bluetooth scan finished.", Toast.LENGTH_SHORT).show();
				
				blackGearFound = false;
				whiteGearFound = false;
				BTAdapter.startDiscovery();
			}
		}
	};
	
	private void sendData(String gear_id, int rssi) {
		// Add your data
		RequestParams params = new RequestParams();
		params.put("device_id", android_id);
		params.put("gear_id", gear_id);
		params.put("rssi", rssi + "");
		
		

		// Execute HTTP Post Request
		httpClient.post(getApplicationContext(), "http://nameless-bastion-3282.herokuapp.com/writeData", params, new AsyncHttpResponseHandler() {
			@Override
			public void onSuccess(int statusCode, org.apache.http.Header[] headers, byte[] responseBody) {
				Toast.makeText(getApplicationContext(), "Successfully sent data to server: " + responseBody, Toast.LENGTH_SHORT).show();
			}

			@Override
			public void onFailure(int statusCode, org.apache.http.Header[] headers, byte[] responseBody, java.lang.Throwable error) {
				Toast.makeText(getApplicationContext(), "Failed to send data to server: " + statusCode, Toast.LENGTH_SHORT).show();
			}
		});
	}

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		android_id = Secure.getString(getBaseContext().getContentResolver(), Secure.ANDROID_ID);
		Button start_button = (Button) findViewById(R.id.start_button);

		start_button.setOnClickListener(new OnClickListener(){
			public void onClick(View v) {
				if (BTAdapter != null) {
					whiteGearFound = false;
					blackGearFound = false;
					BTAdapter.startDiscovery();
				}
				else Toast.makeText(getApplicationContext(), "Bluetooth not working.", Toast.LENGTH_SHORT).show();
			}
		});
		
		Button stop_button = (Button) findViewById(R.id.stop_button);
		stop_button.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				Toast.makeText(getApplicationContext(), "Bluetooth scan cancelled.", Toast.LENGTH_SHORT).show();
				BTAdapter.cancelDiscovery();
			}
		});

		// Create a new HttpClient
		httpClient = new AsyncHttpClient();
		
		BTAdapter = BluetoothAdapter.getDefaultAdapter();
		if (BTAdapter == null) Toast.makeText(getApplicationContext(), "Bluetooth not found", Toast.LENGTH_SHORT).show();
		else if (BTAdapter.isEnabled()) Toast.makeText(getApplicationContext(), "Bluetooth is working. Proceed.", Toast.LENGTH_SHORT).show();
		else Toast.makeText(getApplicationContext(), "Bluetooth not enabled.", Toast.LENGTH_SHORT).show();
		
		registerReceiver(receiver, new IntentFilter(BluetoothDevice.ACTION_FOUND));
		registerReceiver(receiver, new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_STARTED));
		registerReceiver(receiver, new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED));
	}
}