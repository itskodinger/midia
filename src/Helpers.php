<?php

if (!function_exists('midia_css')) {

    /**
     * Midia CSS HTML Tags.
     *
     * @return string
     */
    function midia_css()
    {
        return '<link rel="stylesheet" href="' . asset('vendor/midia/midia.css') . '"><link rel="stylesheet" href="' . asset('vendor/midia/dropzone.css') . '">';
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
        return '<script src="' . asset('vendor/midia/dropzone.js') . '"></script><script src="' . asset('vendor/midia/clipboard.js') . '"></script><script src="' . asset('vendor/midia/midia.js') . '"></script>';
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

if(!function_exists('midia_get_thumbnail')) {
    /**
     * Midia get thumbnails of given image URL
     *
     * @param string $url
     * @param int $size
     * @return string
     */
    function midia_get_thumbnail($url, $size)
    {
        // check if url is on our configured paths
        $directory = str_replace(storage_path().DIRECTORY_SEPARATOR, url("/")."/", config("midia.directory"));
        if(!starts_with($url, $directory)){
            return $url;
        }

        // check if url already contains a thumbnail size
        $parts = explode("/", $url);

        // we are sure that part count always is more than 2 because it starts with public url, so we can skip the check.

        // buffer the image protocol
        $protocol = $parts[0];

        // remove protocol and double slash
        $parts[0] = false; // remove http;
        $parts[1] = false; // remove double slash;

        // if the URL already has a thumbnail size, remove it also
        if(starts_with($parts[count($parts)-2], "thumbs-")){
            $parts[count($parts) - 2] = false;
        }

        // remove the deleted values
        $parts = array_values(array_filter($parts));

        // insert the new thumbnail path part
        array_splice($parts, -1, 0, "thumbs-".$size);

        // create a new  URL and return it.
        $url = $protocol . "//" . implode("/", $parts);
        return $url;
    }
}
