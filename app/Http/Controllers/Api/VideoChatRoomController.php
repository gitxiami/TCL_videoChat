<?php

namespace App\Http\Controllers\Api;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Crypt;

class VideoChatRoomController extends Controller
{
    private $content;

    public function __construct(){
        $this->content = [
            'status'=>-100,
            'msg'=>'lost some important params,please check your config',
            'data'=>[]
        ];
    }

    public function roomAddress($role = '',$roomid = '',$third_id = ""){
        $role = strip_tags($role);
        $roomid = strip_tags(trim((string)$roomid));
        $third_id = intval($third_id);
        $roleAllow = ['anchor','supporter','company'];
        if (!in_array($role,$roleAllow) || !$role) return response()->json($this->content);
        if (!$roomid || empty($roomid) || !isset($roomid)) return response()->json($this->content);


        $url = route('videoChatPlaying');
        $timestamp = time();
        $this->content['status'] = 200;
        $this->content['msg'] = 'Success';
        $this->content['data'] = [
            'url'=>$url,
            'token'=>urlencode(Crypt::encrypt([
                'roomid'=>$roomid,
                'role'=>$role,
                'third_id'=>$third_id,
                'sign'=>md5(sha1('TCL_VIDEOCHATONTHEAIR').sha1($timestamp))
            ])),
            'timestamp'=>$timestamp
        ];
        if ($role == 'anchor'){
            $redis = app('redis.connection');
            $redis->del('TCL_WEBRTCROOM_'.$roomid);
        }
        return response()->json($this->content);
    }
}
