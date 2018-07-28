<?php 

if (!function_exists('midia_css')) {
    
    /**
     * Midia CSS HTML Tags.
     *
     * @return string
     */
    function midia_css()
    {
        return <<<EOT

<link rel="stylesheet" href="{{asset('vendor/midia/midia.css')}}">
<link rel="stylesheet" href="{{asset('vendor/midia/dropzone.css')}}">

EOT;
    }
}

if (!function_exists('midia_js')) {

    /**
     * Midia JS HTML Tags.
     *
     * @return string
     */
    function midia_js()
    {
        return <<<EOT

<script src="{{asset('vendor/midia/dropzone.js')}}"></script>
<script src="{{asset('vendor/midia/clipboard.js')}}"></script>
<script src="{{asset('vendor/midia/midia.js')}}"></script>

EOT;
    }
}

if (!function_exists('midia_time_elapsed')) {

    /**
     * Midia Human-readable Time
     *
     * @param  string  $datetime
     * @param  boolean $full    
     * @return string
     */
    function midia_time_elapsed($datetime, $full=false)
    {
        $datetime = date('Y-m-d h:i:s', $datetime);
        $now = new DateTime;
        $ago = new DateTime($datetime);
        $diff = $now->diff($ago);

        $diff->w = floor($diff->d / 7);
        $diff->d -= $diff->w * 7;

        $string = array(
            'y' => 'year',
            'm' => 'month',
            'w' => 'week',
            'd' => 'day',
            'h' => 'hour',
            'i' => 'minute',
            's' => 'second',
        );
        foreach ($string as $k => &$v) {
            if ($diff->$k) {
                $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? 's' : '');
            } else {
                unset($string[$k]);
            }
        }

        if (!$full) $string = array_slice($string, 0, 1);
        return $string ? implode(', ', $string) : 'just now';
    }
}